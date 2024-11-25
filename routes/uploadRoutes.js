import express from 'express';
import { uploadImageController } from '../controllers/uploadController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// POST route for image upload, with protect middleware
router.post('/', protect, upload.single('image'), uploadImageController);

export default router;
