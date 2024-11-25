import asyncHandler from 'express-async-handler';
import Profile from '../models/profileModel.js';
import User from '../models/userModel.js'; // Ensure you import the User model
import mongoose from 'mongoose';

// Function to validate and convert a string to ObjectId
const convertToObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  } else {
    throw new Error('Invalid ObjectId format');
  }
};

// Create or update user profile and sync it with the user model
export const createOrUpdateProfile = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, email, username, bio, profilePhotoUrl, coverPhotoUrl } = req.body;
  const userId = req.user.id;

  try {
    // Convert userId to ObjectId
    const objectId = convertToObjectId(userId);

    // Find profile and user by userId
    let profile = await Profile.findOne({ user: objectId });
    let user = await User.findById(objectId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the requester is an admin or the owner of the profile
    if (req.user.role !== 'admin' && (!profile || profile.user.toString() !== objectId.toString())) {
      return res.status(403).json({ message: 'Unauthorized: You do not have permission to create or update this profile' });
    }

    // If the profile exists, update it
    if (profile) {
      profile.fullName = fullName || profile.fullName;
      profile.phoneNumber = phoneNumber || profile.phoneNumber;
      profile.email = email || profile.email;
      profile.username = username || profile.username;
      profile.bio = bio || profile.bio;

      // Update profile photo URL if provided
      if (profilePhotoUrl) {
        profile.profilePhoto = profilePhotoUrl;
        user.avatar = profilePhotoUrl; // Sync user avatar with profile photo
      }

      // Update cover photo URL if provided
      if (coverPhotoUrl) {
        profile.coverPhoto = coverPhotoUrl;
      }

      // Update the user's email or name if they've changed
      if (fullName && fullName !== user.name) user.name = fullName;
      if (email && email !== user.email) user.email = email;

      // Save both profile and user
      await profile.save();
      await user.save();

      return res.json({ message: 'Profile updated successfully', profile });
    } 

    // If the profile does not exist, create a new one
    else {
      const newProfile = new Profile({
        user: objectId,
        fullName,
        phoneNumber,
        email,
        username,
        bio,
        profilePhoto: profilePhotoUrl,
        coverPhoto: coverPhotoUrl,
      });

      // Also update the user model if applicable
      if (email) user.email = email;
      if (fullName) user.name = fullName;

      // Sync user avatar with profile photo when creating a new profile
      if (profilePhotoUrl) {
        user.avatar = profilePhotoUrl;
      }

      // Save new profile and updated user
      await newProfile.save();
      await user.save();

      return res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
    }
  } catch (error) {
    console.error('Error in createOrUpdateProfile:', error);
    return res.status(500).json({ message: 'Server error during profile creation or update', error: error.message });
  }
});

// Get profile by userId from params or logged-in user
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id; // Support fetching by params or logged-in user

  try {
    // Convert userId to ObjectId
    const objectId = convertToObjectId(userId);

    const profile = await Profile.findOne({ user: objectId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ message: 'Server error during profile fetch', error: error.message });
  }
});

// Delete user profile and sync it with the user model
export const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    // Convert userId to ObjectId
    const objectId = convertToObjectId(userId);

    // Check if the user is an admin or the owner of the profile
    const profile = await Profile.findOne({ user: objectId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check ownership or role
    if (req.user.role !== 'admin' && profile.user.toString() !== objectId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not have permission to delete this profile' });
    }

    // Delete profile
    await Profile.findOneAndDelete({ user: objectId });

    // Optionally, delete the user as well if required
    await User.findByIdAndDelete(objectId);

    res.json({ message: 'Profile and user deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProfile:', error);
    return res.status(500).json({ message: 'Server error during profile deletion', error: error.message });
  }
});
