import express from 'express';
import { body, validationResult } from 'express-validator';
import { createOrUpdateProfile, getProfile, deleteProfile } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Middleware to protect routes
import { upload } from '../middlewares/uploadMiddleware.js'; // Middleware to handle file uploads

const router = express.Router();

// Create or update user profile (POST method)
router.post(
  '/',
  protect, // Ensure user is authenticated
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  [
    body('fullName').optional().notEmpty().withMessage('Full Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle request
    try {
      await createOrUpdateProfile(req, res);
    } catch (error) {
      console.error('Error in createOrUpdateProfile route:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during profile creation or update',
        error: error.message
      });
    }
  }
);

// Update user profile (PUT method) - Updated Route
router.put(
  '/:userId',
  protect, // Ensure user is authenticated
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  [
    body('fullName').optional().notEmpty().withMessage('Full Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty')
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Handle request
    try {
      await createOrUpdateProfile(req, res);
    } catch (error) {
      console.error('Error in createOrUpdateProfile route:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error during profile update',
        error: error.message
      });
    }
  }
);

// Get user profile by ID
router.get('/:userId', protect, async (req, res) => {
  try {
    await getProfile(req, res); // Ensure getProfile handles req.params.userId
  } catch (error) {
    console.error('Error in getProfile route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during profile fetch',
      error: error.message
    });
  }
});

// Delete user profile
router.delete('/', protect, async (req, res) => {
  try {
    await deleteProfile(req, res);
  } catch (error) {
    console.error('Error in deleteProfile route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during profile deletion',
      error: error.message
    });
  }
});

export default router;
