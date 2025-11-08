// Vercel Serverless Entry Point
// This file is used when deploying to Vercel

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');

// Import passport configuration
let passport;
try {
  passport = require('../config/passport');
} catch (error) {
  console.warn('Passport config not found, OAuth will be disabled');
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Session configuration for OAuth (only if Google OAuth is enabled)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && passport) {
  app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only to API routes
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextcomm';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  // Don't exit in serverless environment, just log the error
});

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/questions', require('../routes/questions'));
app.use('/api/answers', require('../routes/answers'));
app.use('/api/users', require('../routes/users'));
app.use('/api/leaderboard', require('../routes/leaderboard'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/notifications', require('../routes/notifications'));
app.use('/api/ai', require('../routes/ai'));
app.use('/api/bookmarks', require('../routes/bookmarks'));
app.use('/api/unanswered', require('../routes/unanswered'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'NextComm API Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel serverless
module.exports = app;




