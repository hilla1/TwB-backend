// src/routes/contactRoutes.js
import express from 'express';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';
import {
  getAllContacts,
  respondToContact,
  markAsRead,
  deleteContact,
  createContact,
  getContactById
} from '../controllers/contactController.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules for creating a contact message
const validateCreateContact = [
  body('name')
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^(0|\+?[1-9])\d{8,14}$/)
    .withMessage('Invalid phone number format.'),
  body('email')
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Invalid email format.'),
  body('message')
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters.'),
];

// Public route to create a new contact message with validation
router.post('/', validateCreateContact, createContact);

// Get all contact messages (admin/blogger only)
router.get(
  '/',
  protect,
  verifyRole(['admin', 'blogger','consultant']),
  getAllContacts
);

// Respond to a contact message (admin/blogger only)
router.post(
  '/:id/respond',
  protect,
  verifyRole(['admin', 'blogger','consultant']),
  respondToContact
);

// Mark a contact message as read (admin/blogger only)
router.put(
  '/:id/read',
  protect,
  verifyRole(['admin', 'blogger','consultant']),
  markAsRead
);

// Delete a contact message (admin/blogger only)
router.delete(
  '/:id',
  protect,
  verifyRole(['admin', 'blogger','consultant']),
  deleteContact
);

router.get('/:id', 
  protect,
  verifyRole(['admin', 'blogger','consultant']),
  getContactById
);


export default router;
