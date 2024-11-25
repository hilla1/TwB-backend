import express from 'express';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';
import {
  getAllSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  sendMassSubscriptionEmail,
  unsubscribe,
} from '../controllers/subscribeController.js';

const router = express.Router();

// Public route to subscribe
router.post('/', addSubscription);

// Public route to unsubscribe via link (updated to use token instead of ID)
router.get('/unsubscribe/:token', unsubscribe);

// Protected routes (admin/blogger only)

// Get all subscriptions (admin/blogger only)
router.get('/', protect, verifyRole(['admin', 'blogger', 'consultant']), getAllSubscriptions);

// Update an existing subscription (admin/blogger only)
router.put('/:id', protect, verifyRole(['admin', 'blogger', 'consultant']), updateSubscription);

// Delete a subscription (admin/blogger only)
router.delete('/:id', protect, verifyRole(['admin', 'blogger', 'consultant']), deleteSubscription);

// Send mass subscription emails (admin/consultant only)
router.post('/send-mass-email', protect, verifyRole(['admin', 'blogger','consultant']), sendMassSubscriptionEmail);

export default router;
