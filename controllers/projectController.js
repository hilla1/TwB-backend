import ProjectModel from '../models/projectModel.js';
import ExpertModel from '../models/expertModel.js';
import ProfileModel from '../models/profileModel.js';
import natural from 'natural';
import mappingTerms from '../config/mappingTerms.js';
import User from '../models/userModel.js';

// Function to break project description into modules
const breakProjectIntoModules = (description) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(description.toLowerCase());
  const modules = [];

  // Loop through each module in mappingTerms to find relevant keywords in the description
  Object.keys(mappingTerms.modules).forEach((moduleKey) => {
    const { keywords } = mappingTerms.modules[moduleKey];
    const moduleMatch = keywords.some(keyword => tokens.includes(keyword));
    
    if (moduleMatch) {
      const { title, description: moduleDescription, difficulty } = getModuleInfo(moduleKey);
      modules.push({ title, description: moduleDescription, difficulty, unassigned: true }); // Set unassigned to true initially
    }
  });

  return modules.length > 0 ? modules : [{ title: 'General Development', description, unassigned: true }];
};

// Helper function to get module info
const getModuleInfo = (moduleKey) => {
  const moduleTitles = {
    frontend: 'Frontend Development',
    backend: 'Backend Development',
    database: 'Database Design',
    branding: 'Branding and Design',
    content: 'Content Creation',
    marketing: 'Marketing Strategy',
    mobile: 'Mobile App Development',
    ux: 'UX/UI Design',
  };

  const defaultDescriptions = {
    frontend: 'Build the user interface.',
    backend: 'Develop server-side functionalities.',
    database: 'Design and implement the database schema.',
    branding: 'Develop and manage the brand strategy.',
    content: 'Create and manage content.',
    marketing: 'Plan and execute marketing strategies.',
    mobile: 'Develop mobile applications.',
    ux: 'Design user experiences and interfaces.',
  };

  return {
    title: moduleTitles[moduleKey],
    description: defaultDescriptions[moduleKey],
    difficulty: Math.floor(Math.random() * 5) + 1, // Random difficulty for demo purposes
  };
};

// Function to determine required skills from module title using mappingTerms
const determineSkills = (moduleTitle) => {
  const moduleKey = Object.keys(mappingTerms.modules).find((key) =>
    moduleTitle.toLowerCase().includes(key)
  );
  
  return moduleKey ? mappingTerms.modules[moduleKey].skills : ['general'];
};

// Function to assign the best available expert, updating availability
const assignBestExpert = async (module) => {
  const requiredSkills = determineSkills(module.title).map(skill => skill.toLowerCase());

  try {
    const availableExperts = await ExpertModel.find({
      availability: true,
      skillSet: { $in: requiredSkills },
    })
      .populate('userId')
      .sort({ rating: -1, lastAssignedTask: 1 });

    if (!availableExperts || availableExperts.length === 0) {
      throw new Error('No available expert found');
    }

    const randomSelection = Math.random() > 0.3;
    const bestExpert = randomSelection
      ? availableExperts[0]
      : availableExperts[Math.floor(Math.random() * availableExperts.length)];

    const profile = await ProfileModel.findOne({ user: bestExpert.userId });

    const expertDetails = {
      avatar: profile ? profile.profilePhoto : '/defaults/default-avatar.png',
      name: profile ? profile.fullName : 'Anonymous',
      title: profile && profile.bio ? profile.bio : module.title,
    };

    bestExpert.availability = false;
    bestExpert.lastAssignedTask = new Date();
    await bestExpert.save();

    return { expert: bestExpert, expertDetails };
  } catch (error) {
    throw new Error('Error fetching expert: ' + error.message);
  }
};

export const createProject = async (req, res) => {
  const { title, description, deadline } = req.body;
  const userId = req.user?.id;   

  try {
    // Fetch the user's profile and ensure phone number and email are set
    const profile = await ProfileModel.findOne({ user: userId });
    if (!profile) {
      return res.status(400).json({ message: 'Profile not found. Please create a profile first.' });
    }
    
    if (!profile.phoneNumber || !profile.email) {
      return res.status(400).json({ message: 'Please ensure your profile has a phone number and email set before creating a project.' });
    }

    // Break project description into modules
    const modules = breakProjectIntoModules(description);

    // Create a new project instance, including the client ID (userId)
    const project = new ProjectModel({ 
      title, 
      description, 
      deadline, 
      client: userId, // Store the current user ID as client ID
      clientNumber:profile.phoneNumber,
      modules 
    });

    let isAssigned = false; // Track if at least one module has been assigned

    // Loop through each module to try and assign experts
    for (const module of project.modules) {
      try {
        // Try to assign an expert for the module
        const { expert, expertDetails } = await assignBestExpert(module);
        
        // If an expert was found, assign them to the module
        module.expertAssigned = expert.userId;
        module.unassigned = false; // Set unassigned to false after assigning an expert

        module.expertInfo = {
          name: expertDetails.name,
          avatar: expertDetails.avatar,
          title: expertDetails.title,
        };

        isAssigned = true; // At least one module was assigned an expert
      } catch (error) {
        // If no expert was available, log or handle the error for this specific module
        console.warn(`No expert assigned to module "${module.title}":`, error.message);
        // Leave the module as unassigned (true) for admin to assign later
      }
    }

    // Save the project regardless of the assignment status
    await project.save();

    // Return a success response even if no experts were assigned
    res.status(201).json({
      message: 'Project created successfully.',
      project,
      warning: !isAssigned ? 'No experts were available. Admin can assign them later.' : undefined,
    });
  } catch (error) {
    // Handle any error that occurred during project creation
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// Rate an expert after completing a module
export const rateExpert = async (req, res) => {
  const { expertId, rating, projectId, comment } = req.body;

  try {
    const expert = await ExpertModel.findById(expertId);
    if (!expert) return res.status(404).json({ message: 'Expert not found' });

    expert.completedTasks += 1;
    expert.totalRatingScore += rating;
    expert.rating = expert.totalRatingScore / expert.completedTasks;

    expert.availability = true;

    expert.feedback.push({ projectId, score: rating, comment });
    await expert.save();

    // Find the project and update the corresponding module
    const project = await ProjectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const module = project.modules.find(mod => mod.expertAssigned.toString() === expertId);
    if (module) {
      // Mark the module as unassigned after successful completion (if needed)
      // module.unassigned = false; // Uncomment if you want to mark it as assigned after completion
    }

    await project.save(); // Save the updated project

    res.status(200).json({ message: 'Expert rated successfully', expert });
  } catch (error) {
    res.status(500).json({ message: 'Error rating expert', error: error.message });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Get a project by ID
export const getProjectById = async (req, res) => {
  const { id } = req.params; // Get the project ID from request parameters

  try {
    const project = await ProjectModel.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error.message);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

export const updateProjectById = async (req, res) => {
  const { id } = req.params; // Get the project ID from request parameters
  const updateData = req.body; // Get the update data from request body
  const { clientEmail, managerEmail, modules } = updateData; // Extract fields from the request body

  // Null checks for clientEmail and managerEmail
  if (!clientEmail || typeof clientEmail !== 'string') {
    return res.status(400).json({ message: 'Invalid client email' });
  }
  
  if (!managerEmail || typeof managerEmail !== 'string') {
    return res.status(400).json({ message: 'Invalid manager email' });
  }

  // Check if modules is an array
  if (modules && !Array.isArray(modules)) {
    return res.status(400).json({ message: 'Modules should be an array' });
  }

  try {
    // Find client and manager user IDs based on their emails
    const clientUser = await User.findOne({ email: clientEmail });
    const managerUser = await User.findOne({ email: managerEmail });

    // Check if users were found
    if (!clientUser) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (!managerUser) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Update client and manager fields with the found user IDs
    updateData.client = clientUser._id;
    updateData.manager = managerUser._id;

    // If modules are provided, ensure they are processed correctly
    if (modules) {
      updateData.modules = modules; // Assign the modules array directly
    }

    // Perform the update
    const updatedProject = await ProjectModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// Delete a project by ID
export const deleteProjectById = async (req, res) => {
  const { id } = req.params; // Get the project ID from request parameters

  try {
    const deletedProject = await ProjectModel.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully', projectId: id });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Add a new module to a specific project and assign an expert if possible
// Add a new module to a specific project and assign an expert if possible
export const addModule = async (req, res) => {
  try {
    const { projectId } = req.params;
    const newModuleData = req.body;

    // Find the project by ID
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Determine module title and description if not provided
    const moduleTitle = newModuleData.title || 'General Development';
    const moduleDescription = newModuleData.description || 'General project module';

    // Create a new module with unassigned expert by default
    const newModule = {
      title: moduleTitle,
      description: moduleDescription,
      difficulty: Math.floor(Math.random() * 5) + 1, // Assign random difficulty for demo
      unassigned: true,
      expertInfo: {
        name: 'TBD',
        avatar: '/defaults/default-avatar.png',
        title: 'Expert assignment pending',
      },
    };

    // Determine skills required for the module based on title
    const requiredSkills = determineSkills(moduleTitle);

    // Try to assign an expert for the new module based on the provided email
    if (newModuleData.expertAssigned && newModuleData.expertAssigned.trim()) {
      const expert = await ExpertModel.findOne({ email: newModuleData.expertAssigned.trim() });
      if (expert && expert.availability) {
        // Update the module properties to assign the expert
        newModule.expertAssigned = expert._id; // Ensure ObjectId is assigned
        newModule.unassigned = false;
        newModule.expertInfo = {
          name: expert.fullName || 'Anonymous',
          avatar: expert.profilePhoto || '/defaults/default-avatar.png',
          title: expert.bio || 'Expert assignment pending',
        };

        // Mark the expert as unavailable
        expert.availability = false;
        await expert.save();
      } else {
        console.warn(`No available expert found for assignment to new module "${moduleTitle}".`);
      }
    }

    // Add the new module to the project's modules array
    project.modules.push(newModule);
    await project.save();

    // Return success response with updated project
    res.status(201).json({ message: 'Module added successfully', project });
  } catch (error) {
    console.error('Error adding module:', error.message);
    res.status(500).json({ error: 'Failed to add module', details: error.message });
  }
};

// Updating module
export const updateModule = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const updatedData = req.body;

    // Find the project by ID
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Find the module by ID within the project
    const module = project.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Handle expert assignment if 'expertAssigned' email is provided
    if (updatedData.expertAssigned && updatedData.expertAssigned.trim()) {
      // Find the expert directly by email in the ExpertModel
      const expert = await ExpertModel.findOne({ email: updatedData.expertAssigned.trim() });
      if (!expert) {
        return res.status(404).json({ error: 'Assigned expert not found' });
      }

      // Release any previously assigned expert if different from the new one
      if (module.expertAssigned && !module.expertAssigned.equals(expert._id)) {
        await ExpertModel.findByIdAndUpdate(module.expertAssigned, { availability: true });
      }

      // Regardless of availability, assign the expert to the module
      module.expertAssigned = expert._id;  // Store expert's _id
      module.unassigned = false;

      // Retrieve expert profile information
      const profile = await ProfileModel.findOne({ user: expert.userId });

      // Update module with expert info
      module.expertInfo = {
        name: profile?.fullName || 'Anonymous',
        avatar: profile?.profilePhoto || '/defaults/default-avatar.png',
        title: profile?.bio || module.title,
      };

      // Optionally, you can set expert's last assigned task to now and mark them as unavailable if desired
      expert.lastAssignedTask = new Date();
      expert.availability = false;  // Marking as unavailable for new tasks
      await expert.save();
    } else {
      // Unassign current expert if no expertAssigned is provided
      if (module.expertAssigned) {
        await ExpertModel.findByIdAndUpdate(module.expertAssigned, { availability: true });
      }
      module.expertAssigned = null;
      module.unassigned = true;
      module.expertInfo = {};
    }

    // Update other module fields, excluding expert-related fields
    const { expertAssigned, expertInfo, unassigned, ...otherUpdates } = updatedData;
    Object.assign(module, otherUpdates);

    // Save the updated project with the modified module
    await project.save();

    // Return success response
    res.status(200).json({ message: 'Module updated successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update module', details: error.message });
  }
};

// Delete a module from a project
export const deleteModule = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Use pull to remove the module by its ID
    const moduleExists = project.modules.id(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Pull the module out of the array
    project.modules.pull(moduleId);
    await project.save();

    res.status(200).json({ message: 'Module deleted successfully', project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete module', details: error.message });
  }
};
