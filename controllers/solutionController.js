import Solution from '../models/solutionModel.js';

// Get all solutions (accessible by everyone)
export const getAllSolutions = async (req, res) => {
  try {
    const solutions = await Solution.find();
    res.status(200).json(solutions);
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({ message: 'Failed to fetch solutions. Please try again later.' });
  }
};

// Create a new solution (admin/blogger only)
export const createSolution = async (req, res) => {
  try {
    // Include the user who created the solution
    const solutionData = {
      ...req.body,
      createdBy: {
        id: req.user.id,
        email: req.user.email,
      }
    };

    // Validate the input data
    if (!solutionData.category || !solutionData.title || !solutionData.description) {
      return res.status(400).json({ message: 'Category, title, and description are required.' });
    }

    const solution = new Solution(solutionData);
    await solution.save();

    res.status(201).json({ message: 'Solution created successfully', solution });
  } catch (error) {
    console.error('Error creating solution:', error);
    res.status(500).json({ message: 'Failed to create solution. Please try again later.' });
  }
};

// Update a solution (admin/blogger only)
export const updateSolution = async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found.' });
    }

    // Track who updated the solution
    const updateData = {
      ...req.body,
      updatedBy: {
        id: req.user.id,
        email: req.user.email,
      },
    };

    const updatedSolution = await Solution.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ message: 'Solution updated successfully', updatedSolution });
  } catch (error) {
    console.error('Error updating solution:', error);
    res.status(500).json({ message: 'Failed to update solution. Please try again later.' });
  }
};

// Delete a solution (admin/blogger only)
export const deleteSolution = async (req, res) => {
  try {
    const solution = await Solution.findByIdAndDelete(req.params.id);

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found.' });
    }

    res.status(200).json({ message: 'Solution deleted successfully.' });
  } catch (error) {
    console.error('Error deleting solution:', error);
    res.status(500).json({ message: 'Failed to delete solution. Please try again later.' });
  }
};
