import express from 'express';
import {
  createUser,
  updateUser,
  deleteUser,
  blockUnblockUser,
  getUserById,
  getAllUsers,
} from '../controllers/manageUserController.js';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply the protect middleware to all routes to ensure the user is authenticated
router.use(protect);

// Ensure only admins can access the routes
router.use(verifyRole(['admin']));

// Route to create a new user
router.post('/', createUser);

// Route to update user details
router.patch('/:userId', updateUser);

// Route to delete a user
router.delete('/:userId', deleteUser);

// Route to block or unblock a user
router.patch('/:userId/block', blockUnblockUser); 

// Route to get user by id
router.get('/:userId', getUserById);

// Route to get a list of users
router.get('/', getAllUsers);

export default router;
