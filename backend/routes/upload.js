const express = require('express');
const upload = require('../utils/upload');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

// Upload image endpoint
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // If Cloudinary is not configured, return error
    if (!isCloudinaryConfigured) {
      return res.status(503).json({ 
        message: 'Image upload is not configured. Please set Cloudinary environment variables.',
        error: 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required'
      });
    }

    // If using memory storage (fallback), upload to Cloudinary manually
    if (req.file.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nextcomm',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              const errorResponse = res.status(500).json({ 
                message: 'Failed to upload image to Cloudinary',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
              });
              resolve(errorResponse);
              return;
            }
            
            const successResponse = res.json({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              secureUrl: result.secure_url
            });
            resolve(successResponse);
          }
        );
        
        uploadStream.on('error', (error) => {
          console.error('Upload stream error:', error);
          res.status(500).json({ 
            message: 'Failed to upload image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
          reject(error);
        });
        
        uploadStream.end(req.file.buffer);
      });
    }

    // If using CloudinaryStorage, file should have path
    if (req.file.path) {
      return res.json({
        success: true,
        url: req.file.path,
        publicId: req.file.filename,
        secureUrl: req.file.path.replace('http://', 'https://')
      });
    }

    // Fallback error
    return res.status(500).json({ 
      message: 'Failed to process image upload',
      error: 'Unknown upload error'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

