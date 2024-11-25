// middlewares/uploadMiddleware.js
import multer from 'multer';
import cloudinary from '../config/cloudinary.js'; 

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload function
export const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(fileBuffer);
  });
};

export { upload };
