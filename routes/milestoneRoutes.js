// milestoneRoutes.js
import express from 'express';
import {
  getMilestonesByModule,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../controllers/milestoneController.js';

const router = express.Router();

// Route to get milestones by module
router.get('/:moduleId', getMilestonesByModule);

// Route to create a milestone
router.post('/', createMilestone);

// Route to update a milestone
router.patch('/', updateMilestone);

// Route to delete a milestone
router.delete('/', deleteMilestone); 

export default router;
