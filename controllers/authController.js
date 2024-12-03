import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import {
  generateToken,
  generateRefreshToken,
} from '../middlewares/authMiddleware.js';

// Helper function to handle errors
const handleError = (res, statusCode, message, details = null) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    details,
  });
};

// Register a new user (Local)
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return handleError(res, 400, 'Validation error', errors.array());
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 400, 'User already exists');
    }

    // Create a new user with default role 'client'
    const newUser = new User({ name, email, password, role: 'client' });
    await newUser.save();

    // Create a new profile for the user
    const profile = new Profile({
      user: newUser._id,
      fullName: name,
      email: newUser.email,
      username: email.split('@')[0], 
    });
    await profile.save();

    // Respond with status only
    res.json({
      status: 'registered',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};


// Sign in user (Local)
export const signInUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return handleError(res, 400, 'Invalid email or password');
    }

    // Generate JWT token and refresh token
    const token = generateToken(user);
    const refreshTokenValue = generateRefreshToken(user);

    // Set cookies for JWT and refresh token (HTTP-only)
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes expiry
    });
    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    });

    // Respond with status only
    res.json({
      status: 'authenticated',
    });
  } catch (error) {
    console.error('Sign In Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Update user details (requires authentication via JWT)
export const updateUserHandler = async (req, res, next) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    console.error('Update Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Delete a user (requires authentication via JWT)
export const deleteUserHandler = async (req, res, next) => {
  try {
    await deleteUser(req, res);
  } catch (error) {
    console.error('Delete Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Get user data (requires authentication via JWT)
export const getMe = async (req, res, next) => {
  try {
    // Retrieve user information from the request object
    const user = req.user;

    // Respond with the user data
    res.json({
      status: 'success',
      user,
    });
  } catch (error) {
    console.error('Get User Data Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Logout route
export const logoutUser = (req, res) => {
  // Clear the JWT and refresh token cookies
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Respond with success message
  res.json({ status: 'success', message: 'Logged out successfully' });
};
