const multer = require('multer');

// Always use memory storage for better serverless compatibility
// We'll upload to Cloudinary manually in the route handler
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: storage,
  // No file size limit - removed as per user request
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = upload;

