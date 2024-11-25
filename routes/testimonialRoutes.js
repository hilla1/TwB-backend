import express from 'express';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';
import * as testimonialController from '../controllers/testimonialController.js';

const router = express.Router();

// Public route to get all testimonials (accessible to everyone)
router.get('/', testimonialController.getAllTestimonials);

// Admin/Blogger protected routes for create, update, delete
router.post(
  '/',
  protect,
  verifyRole(['admin', 'blogger']),
  testimonialController.createTestimonial
);

router.put(
  '/:id',
  protect,
  verifyRole(['admin', 'blogger']),
  testimonialController.updateTestimonial
);

router.delete(
  '/:id',
  protect,
  verifyRole(['admin', 'blogger']),
  testimonialController.deleteTestimonial
);

export default router;
