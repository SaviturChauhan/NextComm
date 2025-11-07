const mongoose = require('mongoose');

const BookmarkListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  color: {
    type: String,
    default: '#6366f1' // Default indigo color
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure user can't have duplicate list names
BookmarkListSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('BookmarkList', BookmarkListSchema);

