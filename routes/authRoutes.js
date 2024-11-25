import express from 'express';
import { body } from 'express-validator';
import { protect,refreshToken } from '../middlewares/authMiddleware.js';
import {
  registerUser,
  signInUser,
  updateUserHandler,
  deleteUserHandler,
  getMe,
  logoutUser
} from '../controllers/authController.js';
import {
  googleOAuthRedirect,
  googleOAuthCallback,
} from '../controllers/googleController.js'; 

const router = express.Router();

// Register a new user (Local)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  registerUser
);

// Sign in user (Local)
router.post('/signin', signInUser);

// Refresh token route
router.post('/refresh-token', refreshToken);

// Google OAuth routes
router.get('/google', googleOAuthRedirect); // Redirect to Google OAuth
router.post('/oauth/callback', googleOAuthCallback); // Handle Google OAuth callback

// Update user details (requires authentication via JWT stored in cookies)
router.put('/:id', protect, updateUserHandler);

// Delete a user (requires authentication via JWT stored in cookies)
router.delete('/:id', protect, deleteUserHandler);

// Get current user data (requires authentication via JWT stored in cookies)
router.get('/me', protect, getMe);

// Logout route (clears the authentication cookies)
router.get('/logout', logoutUser);

export default router;
