// routes/articleRoutes.js
import express from 'express';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../controllers/articleController.js';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all articles
router.get('/', getArticles);

// Create a new article (authenticated users only)
router.post('/', protect, verifyRole(['blogger', 'admin']), createArticle);

// Update an article (only author or admin can update)
router.put('/:id', protect, verifyRole(['blogger', 'admin']), updateArticle);

// Delete an article (only author or admin can delete)
router.delete('/:id', protect, verifyRole(['blogger', 'admin']), deleteArticle);

export default router;
