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

// Test Cloudinary connection endpoint (for debugging)
router.get('/test', auth, async (req, res) => {
  try {
    if (!isCloudinaryConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary is not configured',
        details: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
          api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
          api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
        }
      });
    }

    // Test Cloudinary connection
    cloudinary.api.ping((error, result) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary connection test failed',
          error: error.message,
          details: {
            http_code: error.http_code,
            name: error.name
          }
        });
      }

      res.json({
        success: true,
        message: 'Cloudinary connection successful',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        result: result
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing Cloudinary',
      error: error.message
    });
  }
});

// Upload image endpoint
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('=== IMAGE UPLOAD REQUEST ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    console.log('File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer,
      hasPath: !!req.file.path
    } : 'No file');
    console.log('Cloudinary configured:', isCloudinaryConfigured);
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
    console.log('API key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('API secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No image file provided' });
    }

    // If Cloudinary is not configured, return error
    if (!isCloudinaryConfigured) {
      console.error('Cloudinary not configured');
      return res.status(503).json({ 
        message: 'Image upload is not configured. Please set Cloudinary environment variables.',
        error: 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required'
      });
    }

    // Upload to Cloudinary using memory buffer
    if (!req.file.buffer) {
      console.error('No file buffer found');
      return res.status(500).json({ 
        message: 'Failed to process image upload',
        error: 'File buffer not available'
      });
    }

    console.log('Uploading to Cloudinary...');
    console.log('File size:', req.file.buffer.length, 'bytes');
    console.log('File type:', req.file.mimetype);

    // Upload to Cloudinary using upload_stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nextcomm',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            console.error('Error details:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              error: error.error
            });
            if (!res.headersSent) {
              res.status(500).json({ 
                message: 'Failed to upload image to Cloudinary',
                error: error.message || 'Upload failed. Please check server logs.',
                details: process.env.NODE_ENV === 'development' ? {
                  http_code: error.http_code,
                  name: error.name,
                  error: error.error
                } : undefined
              });
            }
            resolve();
            return;
          }
          
          if (!result) {
            console.error('❌ No result from Cloudinary');
            if (!res.headersSent) {
              res.status(500).json({ 
                message: 'Failed to upload image',
                error: 'No response from Cloudinary'
              });
            }
            resolve();
            return;
          }
          
          console.log('✅ Image uploaded successfully');
          console.log('   URL:', result.secure_url);
          console.log('   Public ID:', result.public_id);
          
          if (!res.headersSent) {
            res.json({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              secureUrl: result.secure_url
            });
          }
          resolve();
        }
      );
      
      uploadStream.on('error', (error) => {
        console.error('❌ Upload stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            message: 'Failed to upload image',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
          });
        }
        reject(error);
      });
      
      // Write buffer to stream
      uploadStream.end(req.file.buffer);
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to upload image',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Upload failed'
      });
    }
  }
});

module.exports = router;

