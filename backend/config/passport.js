const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - Only initialize if credentials are provided
// Trim values to handle any whitespace issues
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (googleClientId && googleClientSecret) {
  // Get callback URL - must be full URL in production
  // Priority: GOOGLE_CALLBACK_URL > BACKEND_URL > VERCEL_URL > localhost
  let callbackURL = process.env.GOOGLE_CALLBACK_URL?.trim();
  if (!callbackURL) {
    // Try to get backend URL from environment
    let backendUrl = process.env.BACKEND_URL?.trim();
    if (!backendUrl) {
      // In Vercel, VERCEL_URL is available but may not include protocol
      const vercelUrl = process.env.VERCEL_URL;
      if (vercelUrl) {
        backendUrl = `https://${vercelUrl}`;
      } else {
        backendUrl = 'http://localhost:5001';
      }
    }
    callbackURL = `${backendUrl}/api/auth/google/callback`;
  }
  
  // Remove trailing slash if present
  callbackURL = callbackURL.replace(/\/$/, '');
  
  console.log('🔵 Google OAuth Strategy initialized');
  console.log('   Client ID:', googleClientId.substring(0, 20) + '...');
  console.log('   Callback URL:', callbackURL);
  
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth strategy - Profile received:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName
    });

    // Validate profile data
    if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
      return done(new Error('No email found in Google profile'), null);
    }

    const email = profile.emails[0].value.toLowerCase().trim();
    if (!email) {
      return done(new Error('Invalid email in Google profile'), null);
    }

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      console.log('Found existing user with Google ID:', user._id);
      return done(null, user);
    }

    // Check if user exists with this email (account linking)
    user = await User.findOne({ email: email });
    if (user) {
      console.log('Found existing user with email, linking Google account:', user._id);
      // Link Google account to existing user
      user.googleId = profile.id;
      user.authProvider = 'google';
      if (!user.avatar && profile.photos && profile.photos[0]) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Create new user
    console.log('Creating new user from Google profile');
    const displayName = profile.displayName || profile.name?.givenName || 'User';
    
    // Generate username from display name (max 30 chars as per schema)
    const baseUsername = displayName
      .replace(/\s+/g, '')
      .toLowerCase()
      .substring(0, 20); // Reserve space for random number
    const randomSuffix = Math.floor(Math.random() * 10000);
    let username = `${baseUsername}${randomSuffix}`;
    
    // Ensure username is unique and within length limit
    let uniqueUsername = username.substring(0, 30);
    let counter = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      const suffix = counter.toString();
      uniqueUsername = `${baseUsername}${randomSuffix}${suffix}`.substring(0, 30);
      counter++;
      if (counter > 999) {
        // Fallback if too many collisions
        uniqueUsername = `user${Date.now()}${Math.floor(Math.random() * 1000)}`.substring(0, 30);
        break;
      }
    }

    console.log('Creating user with username:', uniqueUsername);
    user = new User({
      username: uniqueUsername,
      email: email,
      googleId: profile.id,
      authProvider: 'google',
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      password: undefined // Don't set password for OAuth users
    });

    await user.save();
    console.log('New user created successfully:', user._id);
    return done(null, user);
  } catch (error) {
    console.error('❌ Error in Google OAuth strategy:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return done(error, null);
  }
  }));
} else {
  console.warn('⚠️  Google OAuth credentials not configured. Google Sign-In will be disabled.');
  console.warn('   To enable, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
}

module.exports = passport;

