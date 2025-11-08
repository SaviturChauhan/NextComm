// Vercel Serverless Entry Point
// This file is used when deploying to Vercel

// Load environment variables FIRST
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('Please set these in your Vercel project settings.');
}

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
// Always allow all *.vercel.app subdomains for preview deployments (if deployed on Vercel)
// This is safe because:
// 1. Only allows vercel.app domains (not arbitrary domains)
// 2. Vercel preview deployments are temporary and secure
// 3. Supports all preview deployment patterns (git branches, PRs, etc.)
// 4. Works regardless of what FRONTEND_URL is set to
allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
console.log('✅ CORS: Added Vercel wildcard pattern for all preview deployments');

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

// MongoDB connection - handle serverless environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextcomm';

if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/nextcomm') {
  console.error('❌ ERROR: MONGODB_URI not set! Database connection will fail.');
  console.error('Please set MONGODB_URI environment variable in Vercel dashboard.');
}

// Cache the connection promise to reuse across serverless invocations
let cachedConnection = null;

async function connectDatabase() {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress, waiting...');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  // Start new connection
  if (!cachedConnection) {
    console.log('🔄 Establishing MongoDB connection...');
    console.log('MONGODB_URI:', MONGODB_URI ? MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'NOT SET');
    
    cachedConnection = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 1, // Limit connections for serverless
      minPoolSize: 1,
    })
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      console.log('Database:', mongoose.connection.db?.databaseName || 'unknown');
      console.log('Connection state:', mongoose.connection.readyState);
      return mongoose.connection;
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      cachedConnection = null; // Reset on error so we can retry
      throw err;
    });
  }

  return cachedConnection;
}

// Connect to database immediately
connectDatabase().catch(err => {
  console.error('❌ Failed to connect to MongoDB on startup:', err.message);
});

// Middleware to ensure MongoDB connection before handling requests
app.use(async (req, res, next) => {
  // Skip health check and root endpoint
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  try {
    // Ensure database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Database not connected, attempting connection...');
      await connectDatabase();
    }
    next();
  } catch (error) {
    console.error('❌ Database connection failed in middleware:', error.message);
    return res.status(503).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
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




