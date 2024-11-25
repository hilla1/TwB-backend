import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import asyncHandler from 'express-async-handler'; // To handle async errors

// Create a new user
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, fullName, phoneNumber, bio, profilePhoto, coverPhoto, username } = req.body;

  // Normalize the role to lowercase
  const normalizedRole = role ? role.toLowerCase() : undefined;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create a new user
  const user = await User.create({ name, email, password, role: normalizedRole });
  if (user) {
    // Create a default profile for the new user
    const profile = await Profile.create({
      user: user._id,
      email: user.email,
      username: username || email.split('@')[0], // Use provided username or fallback to email prefix
      fullName: fullName || name, // Use fullName if provided, otherwise fallback to name
      phoneNumber: phoneNumber || '',
      bio: bio || '',
      profilePhoto: profilePhoto || '/defaults/default-avatar.png',
      coverPhoto: coverPhoto || '/defaults/default-cover.jpg'
    });

    // No need to manually link profile to user since we're using virtuals

    res.status(201).json(user);
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// Update user details
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, fullName, phoneNumber, bio, profilePhoto, coverPhoto, username } = req.body;

  // Normalize the role to lowercase
  const normalizedRole = role ? role.toLowerCase() : undefined;

  // Find and update the user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = normalizedRole || user.role;

  const updatedUser = await user.save();

  // Update profile details
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    // Create a new profile if it doesn't exist
    profile = await Profile.create({
      user: userId,
      email: updatedUser.email,
      username: username || email.split('@')[0], // Use provided username or fallback to email prefix
      fullName: fullName || updatedUser.name,
      phoneNumber: phoneNumber || '',
      bio: bio || '',
      profilePhoto: profilePhoto || '/defaults/default-avatar.png',
      coverPhoto: coverPhoto || '/defaults/default-cover.jpg'
    });
  } else {
    // Update existing profile
    profile.username = username || profile.username;
    profile.fullName = fullName || profile.fullName;
    profile.phoneNumber = phoneNumber || profile.phoneNumber;
    profile.bio = bio || profile.bio;
    profile.profilePhoto = profilePhoto || profile.profilePhoto;
    profile.coverPhoto = coverPhoto || profile.coverPhoto;

    await profile.save();
  }

  res.json(updatedUser);
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the user ID format (optional but recommended)
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  // Find and delete the user
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove the associated profile
  await Profile.findOneAndDelete({ user: userId });

  res.json({ message: 'User and associated profile removed successfully' });
});

// Block/Unblock user
const blockUnblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Find and update the user's blocked status
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.blocked = !user.blocked;
  const updatedUser = await user.save();
  res.json(updatedUser);
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  // Use select to exclude the password field
  const users = await User.find().select('-password').populate('profile');
  res.json(users);
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the user ID format (optional but recommended)
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  // Find the user and populate the profile, excluding the password field
  const user = await User.findById(userId).select('-password').populate('profile');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

export {
  createUser,
  updateUser,
  deleteUser,
  blockUnblockUser,
  getAllUsers,
  getUserById,
};
