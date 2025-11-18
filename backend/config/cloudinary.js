const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary only if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('   API key:', process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...');
  
  // Test Cloudinary connection
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('❌ Cloudinary connection test failed:', error.message);
    } else {
      console.log('✅ Cloudinary connection test successful');
    }
  });
} else {
  console.warn('⚠️  Cloudinary credentials not found. Image upload will be disabled.');
  console.warn('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.');
}

module.exports = cloudinary;

