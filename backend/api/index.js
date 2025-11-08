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

// CORS configuration - support multiple origins for Vercel preview deployments
const allowedOrigins = [];

// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Add Vercel preview deployment pattern (supports git branches, PR previews, etc.)
// If FRONTEND_URL is a Vercel domain, allow all *.vercel.app subdomains for preview deployments
if (process.env.FRONTEND_URL) {
  const frontendDomain = process.env.FRONTEND_URL.replace('https://', '').replace('http://', '').split('/')[0];
  
  // Check if it's a Vercel domain
  if (frontendDomain.includes('.vercel.app')) {
    // Allow all Vercel preview deployments (*.vercel.app)
    // This is safe because:
    // 1. Only allows vercel.app domains (not arbitrary domains)
    // 2. Vercel preview deployments are temporary and secure
    // 3. Supports all preview deployment patterns (git branches, PRs, etc.)
    allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
    console.log('✅ CORS: Added Vercel wildcard pattern for preview deployments');
  }
}

// Add localhost for development
allowedOrigins.push('http://localhost:3000');
allowedOrigins.push('http://localhost:3001');

// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    for (const allowedOrigin of allowedOrigins) {
      if (typeof allowedOrigin === 'string') {
        if (origin === allowedOrigin) {
          return callback(null, true);
        }
      } else if (allowedOrigin instanceof RegExp) {
        if (allowedOrigin.test(origin)) {
          return callback(null, true);
        }
      }
    }

    // Log blocked origin for debugging
    console.warn('⚠️ CORS blocked origin:', origin);
    console.warn('   Allowed origins:', allowedOrigins.filter(o => typeof o === 'string'));
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Block in production if not in allowed list
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

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

if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/nextcomm') {
  console.warn('⚠️  Warning: MONGODB_URI not set or using default. Database connection may fail in production.');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  // Don't exit in serverless environment, just log the error
  // The connection will be retried on next request
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
  console.error('❌ Unhandled error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      name: err.name
    })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel serverless
module.exports = app;




