// milestoneController.js
import ProjectModel from '../models/projectModel.js'; 

// Get all milestones for a specific module
export const getMilestonesByModule = async (req, res) => {
  const { moduleId } = req.params;

  try {
    // Fetch the specific module with only milestones data
    const project = await ProjectModel.findOne({ 'modules._id': moduleId }).select('modules.$');

    if (!project) {
      return res.status(404).json({ message: 'Project or module not found' });
    }

    const module = project.modules.id(moduleId);
    return res.status(200).json(module.milestones);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a new milestone
export const createMilestone = async (req, res) => {
  const { moduleId, description } = req.body;

  try {
    const project = await ProjectModel.findOneAndUpdate(
      { 'modules._id': moduleId },
      { 
        $push: {
          'modules.$.milestones': {
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
            complete: false,
          }
        }
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project or module not found' });
    }

    // Return the updated list of milestones
    const module = project.modules.id(moduleId);
    return res.status(201).json(module.milestones);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing milestone
export const updateMilestone = async (req, res) => {
  const { milestoneId, moduleId, description, complete } = req.body;

  try {
    const project = await ProjectModel.findOneAndUpdate(
      { 'modules._id': moduleId, 'modules.milestones._id': milestoneId },
      {
        $set: {
          'modules.$.milestones.$[milestone].description': description,
          'modules.$.milestones.$[milestone].complete': complete,
          'modules.$.milestones.$[milestone].updatedAt': new Date(),
        }
      },
      {
        new: true,
        arrayFilters: [{ 'milestone._id': milestoneId }],
      }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project, module, or milestone not found' });
    }

    // Return the updated milestone
    const module = project.modules.id(moduleId);
    const milestone = module.milestones.id(milestoneId);
    return res.status(200).json(milestone);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete an existing milestone
export const deleteMilestone = async (req, res) => {
  const { milestoneId, moduleId } = req.body;

  try {
    const project = await ProjectModel.findOneAndUpdate(
      { 'modules._id': moduleId },
      { $pull: { 'modules.$.milestones': { _id: milestoneId } } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project, module, or milestone not found' });
    }

    return res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
