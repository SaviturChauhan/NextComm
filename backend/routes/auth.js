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

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again in a moment.',
        error: 'DATABASE_NOT_CONNECTED'
      });
    }

    // Check if user exists
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } catch (dbError) {
      console.error('❌ Database error during user lookup:', dbError);
      console.error('Error name:', dbError.name);
      console.error('Error message:', dbError.message);
      return res.status(503).json({ 
        message: 'Database error. Please try again.',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    if (!user) {
      console.log('Login attempt: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is an OAuth-only user (no password set)
    if (!user.password && (user.authProvider === 'google' || user.googleId)) {
      console.log('Login attempt: OAuth user tried to login with password:', email);
      return res.status(400).json({ 
        message: 'This account was created with Google Sign-In. Please use Google Sign-In to access your account.',
        useOAuth: true
      });
    }

    // Check if user has a password
    if (!user.password) {
      console.log('Login attempt: User has no password set:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    try {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Login attempt: Invalid password for email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } catch (compareError) {
      console.error('Error comparing password:', compareError);
      return res.status(500).json({ message: 'Server error during authentication' });
    }

    // Update last active (non-blocking)
    try {
      await user.updateLastActive();
    } catch (updateError) {
      console.warn('Warning: Could not update last active:', updateError.message);
      // Continue even if this fails
    }

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('Login successful for user:', user._id, user.email);

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
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', { email: req.body.email });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    console.log('🔵 Initiating Google OAuth');
    console.log('Request origin:', req.get('origin'));
    console.log('Request host:', req.get('host'));
    console.log('Request protocol:', req.protocol);
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });

  // Google OAuth Callback
  router.get('/google/callback', 
    (req, res, next) => {
      console.log('🔵 Google OAuth callback received');
      console.log('Query params:', req.query);
      console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
      
      passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
      })(req, res, next);
    },
    async (req, res) => {
      try {
        console.log('🟢 Google OAuth callback handler started');
        console.log('Request user:', req.user ? 'User exists' : 'No user');
        
        if (!req.user) {
          console.error('❌ Error: User not found in request after authentication');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
        }
        
        const user = req.user;
        console.log('✅ User ID:', user._id);
        console.log('✅ User email:', user.email);
        console.log('✅ User username:', user.username);
        
        // Generate JWT token
        if (!process.env.JWT_SECRET) {
          console.error('❌ JWT_SECRET is not configured');
          throw new Error('JWT_SECRET is not configured');
        }
        
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ JWT token generated successfully');

        // Update last active (non-blocking)
        try {
          await user.updateLastActive();
        } catch (updateError) {
          console.warn('⚠️ Warning: Could not update last active:', updateError.message);
          // Continue even if this fails
        }

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/google/callback?token=${encodeURIComponent(token)}&success=true`;
        console.log('🔄 Redirecting to frontend:', redirectUrl.substring(0, 100) + '...');
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Error in Google OAuth callback:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
        res.redirect(`${frontendUrl}/login?error=google_auth_failed&details=${errorMessage}`);
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

