import express from 'express';
import {
  getAllSolutions,
  createSolution,
  updateSolution,
  deleteSolution
} from '../controllers/solutionController.js';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to get all solutions (accessible to everyone)
router.get('/', getAllSolutions);

// Admin/Blogger protected routes for create, update, delete
router.post(
  '/',
  protect, // Ensures user is authenticated
  verifyRole(['admin', 'blogger']), // Allows only admin or blogger to create
  createSolution
);

router.put(
  '/:id',
  protect, // Ensures user is authenticated
  verifyRole(['admin', 'blogger']), // Allows only admin or blogger to update
  updateSolution
);

router.delete(
  '/:id',
  protect, // Ensures user is authenticated
  verifyRole(['admin', 'blogger']), // Allows only admin or blogger to delete
  deleteSolution
);

// Export the router as default
export default router;
