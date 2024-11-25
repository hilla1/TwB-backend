import ExpertModel from '../models/expertModel.js';
import UserModel from '../models/userModel.js';

// Create a new expert
export const createExpert = async (req, res) => {
  const { email, skillSet } = req.body;

  try {
    const user = await UserModel.findOne({ email, role: { $in: ['consultant', 'freelancer', 'admin', 'blogger'] } });

    if (!user) {
      return res.status(404).json({ message: 'User not found or not eligible to become an expert' });
    }

    const expertExists = await ExpertModel.findOne({ userId: user._id });
    if (expertExists) {
      return res.status(400).json({ message: 'User is already an expert' });
    }

    const newExpert = new ExpertModel({
      userId: user._id,
      email: user.email,
      skillSet: skillSet.split(',').map(skill => skill.trim().toLowerCase()),
    });

    await newExpert.save();

    return res.status(201).json({
      message: 'Expert created successfully',
      expert: {
        _id: newExpert._id,
        email: user.email,
        role: user.role,
        skillSet: newExpert.skillSet,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating expert', error: error.message });
  }
};

// Get all experts
export const getAllExperts = async (req, res) => {
  try {
    const experts = await ExpertModel.find(); // autopopulate will handle population

    const formattedExperts = experts.map((expert) => ({
      _id: expert._id,
      email: expert.email,
      role: expert.userId.role, // autopopulated userId role
      skillSet: expert.skillSet,
    }));

    return res.status(200).json(formattedExperts);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching experts', error: error.message });
  }
};

// Update an expert by ID
export const updateExpert = async (req, res) => {
  const { id } = req.params;
  const { email, skillSet } = req.body;

  try {
    const user = await UserModel.findOne({ email, role: { $in: ['consultant', 'freelancer', 'admin', 'blogger'] } });

    if (!user) {
      return res.status(404).json({ message: 'User not found or not eligible to update as expert' });
    }

    const updatedExpert = await ExpertModel.findByIdAndUpdate(
      id, 
      { userId: user._id, email: user.email, skillSet: skillSet.split(',').map(skill => skill.trim().toLowerCase()) }, 
      { new: true }
    );

    if (!updatedExpert) {
      return res.status(404).json({ message: 'Expert not found' });
    }

    return res.status(200).json({
      message: 'Expert updated successfully',
      expert: {
        _id: updatedExpert._id,
        email: user.email,
        role: user.role,
        skillSet: updatedExpert.skillSet,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating expert', error: error.message });
  }
};

// Delete an expert by ID
export const deleteExpert = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpert = await ExpertModel.findByIdAndDelete(id);

    if (!deletedExpert) {
      return res.status(404).json({ message: 'Expert not found' });
    }

    return res.status(200).json({
      message: 'Expert deleted successfully',
      _id: deletedExpert._id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting expert', error: error.message });
  }
};
