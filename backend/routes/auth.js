const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Generate JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        badges: user.badges,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active
    await user.updateLastActive();

    // Generate JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        badges: user.badges,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
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
      return res.status(400).json({ errors: errors.array() });
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
      passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
      })(req, res, next);
    },
    async (req, res) => {
      try {
        console.log('Google OAuth callback handler started');
        console.log('Request user:', req.user ? 'User exists' : 'No user');
        
        if (!req.user) {
          console.error('Error: User not found in request after authentication');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log('Redirecting to frontend:', `${frontendUrl}/auth/google/callback?token=${token.substring(0, 20)}...&success=true`);
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('❌ Error in Google OAuth callback:', error);
        console.error('Error stack:', error.stack);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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

