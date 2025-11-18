const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Frontend URL configuration - always use FRONTEND_URL from environment if available
// In production, FRONTEND_URL should always be set
const getFrontendUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    console.warn('⚠️  WARNING: FRONTEND_URL is not set in production environment');
  }
  
  return frontendUrl;
};

// Register - DISABLED: Only Google OAuth registration is allowed
router.post('/register', (req, res) => {
  return res.status(403).json({ 
    message: 'Email/password registration is disabled. Please use Google Sign-In to create an account.',
    errors: [{ msg: 'Only Google OAuth registration is allowed', param: 'auth' }]
  });
});

// Login - DISABLED: Only Google OAuth is allowed
router.post('/login', (req, res) => {
  return res.status(403).json({ 
    message: 'Email/password login is disabled. Please use Google Sign-In.',
    errors: [{ msg: 'Only Google OAuth authentication is allowed', param: 'auth' }]
  });
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle username update
    if (username !== undefined && username !== user.username) {
      const trimmedUsername = username.trim();
      
      // Check if username is already taken (case-insensitive)
      const existingUser = await User.findOne({ 
        username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') },
        _id: { $ne: req.userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username is already taken',
          errors: [{ msg: 'Username is already taken', param: 'username' }]
        });
      }
      
      user.username = trimmedUsername;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      points: user.points,
      badges: user.badges,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ 
        message: 'Username is already taken',
        errors: [{ msg: 'Username is already taken', param: 'username' }]
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Routes - Only register if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Initiate Google OAuth
  router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ message: 'Google OAuth is not configured' });
    }
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });

  // Google OAuth Callback
  router.get('/google/callback', 
    (req, res, next) => {
      console.log('Google OAuth callback received');
      const frontendUrl = getFrontendUrl();
      passport.authenticate('google', { 
        session: false,
        failureRedirect: `${frontendUrl}/login?error=google_auth_failed`
      })(req, res, next);
    },
    async (req, res) => {
      try {
        console.log('Google OAuth callback handler started');
        console.log('Request user:', req.user ? 'User exists' : 'No user');
        
        const frontendUrl = getFrontendUrl();
        
        if (!req.user) {
          console.error('Error: User not found in request after authentication');
          return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
        }
        
        const user = req.user;
        console.log('User ID:', user._id);
        console.log('User email:', user.email);
        
        // Generate JWT token
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not configured');
        }
        
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('JWT token generated successfully');

        // Update last active
        try {
          await user.updateLastActive();
        } catch (updateError) {
          console.warn('Warning: Could not update last active:', updateError.message);
          // Continue even if this fails
        }

        // Redirect to frontend with token
        console.log('Redirecting to frontend:', `${frontendUrl}/auth/google/callback?token=${token.substring(0, 20)}...&success=true`);
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('❌ Error in Google OAuth callback:', error);
        console.error('Error stack:', error.stack);
        const frontendUrl = getFrontendUrl();
        res.redirect(`${frontendUrl}/login?error=google_auth_failed&details=${encodeURIComponent(error.message)}`);
      }
    }
  );
} else {
  // Provide a helpful error message if Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.',
      setup: 'See GOOGLE_SIGNIN_SETUP.md for instructions'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'
    });
  });
}

module.exports = router;

