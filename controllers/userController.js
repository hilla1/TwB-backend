import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import bcrypt from 'bcryptjs';

// Delete a user
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user's profile
    await Profile.findOneAndDelete({ user: userId });

    // Delete the user
    await user.deleteOne();

    res.json({ message: 'User and profile deleted successfully' });
  } catch (err) {
    console.error('Error during user deletion:', err.message);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Update user password
export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    // Check if the requesting user is an admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.id === userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is not an admin, require the old password
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this password' });
    }

    // Check if the old password is required
    if (!isAdmin) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Old password is required for password update' });
      }

      // Check if the old password is correct for account owner
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err.message);
    res.status(500).json({ message: 'Error updating password' });
  }
};