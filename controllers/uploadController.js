// controllers/uploadController.js
import { uploadToCloudinary } from '../middlewares/uploadMiddleware.js';

// Image Upload Controller
export const uploadImageController = async (req, res) => {
  try {
    // Check if the file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer; // Get the file buffer from multer
    const imageUrl = await uploadToCloudinary(fileBuffer); // Upload to Cloudinary

    // Respond with the image URL
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Image upload failed' });
  }
};
