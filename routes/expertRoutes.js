import express from 'express';
import { 
  createExpert, 
  getAllExperts, 
  updateExpert, 
  deleteExpert 
} from '../controllers/expertController.js';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply the protect middleware to all routes to ensure the user is authenticated
router.use(protect);

// Ensure only admins can access the routes
router.use(verifyRole(['admin']));

// Define routes for experts
router.post('/', createExpert); // Create a new expert
router.get('/', getAllExperts); // Get all experts
router.put('/:id', updateExpert); // Update an expert by ID
router.delete('/:id', deleteExpert); // Delete an expert by ID

export default router;
