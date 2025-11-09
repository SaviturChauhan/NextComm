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

// MongoDB connection - optimized for Vercel serverless
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not set! Database connection will fail.');
  console.error('Please set MONGODB_URI environment variable in Vercel dashboard.');
  console.error('Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
} else {
  // Log connection string (masked) for debugging
  const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('📦 MONGODB_URI configured:', maskedUri.split('?')[0] + '?***');
}

// Global connection cache for serverless (reused across invocations)
let cachedConnection = null;

// Optimized connection options for serverless environments
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // 15 seconds - enough for serverless cold starts
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 15000, // 15 seconds
  maxPoolSize: 1, // Single connection for serverless (reduces overhead)
  minPoolSize: 0, // Allow no connections when idle (saves resources)
  maxIdleTimeMS: 30000, // Close idle connections after 30s
  heartbeatFrequencyMS: 10000, // Check connection health every 10s
  retryWrites: true,
  w: 'majority',
};

async function connectDatabase() {
  // If already connected and ready, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it (with timeout)
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress, waiting...');
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout - connection took too long'));
      }, 20000);

      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve(mongoose.connection);
      });

      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  // Start new connection (only if not already attempting)
  if (!cachedConnection) {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured. Please set it in Vercel environment variables.');
    }

    console.log('🔄 Establishing MongoDB connection...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    cachedConnection = mongoose.connect(MONGODB_URI, mongooseOptions)
      .then((connection) => {
        console.log('✅ MongoDB connected successfully');
        console.log('Database:', connection.connection.db?.databaseName || 'unknown');
        console.log('Connection state:', connection.connection.readyState);
        console.log('Host:', connection.connection.host || 'unknown');
        return connection;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.name);
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        
        // Provide helpful error messages
        if (err.message.includes('authentication failed')) {
          console.error('💡 Tip: Check your MongoDB username and password in the connection string');
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
          console.error('💡 Tip: Check your MongoDB cluster URL/hostname');
          console.error('💡 Tip: Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0)');
        } else if (err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
          console.error('💡 Tip: Connection timeout - check MongoDB Atlas network access');
          console.error('💡 Tip: Verify your MongoDB cluster is running');
        } else if (err.code === 'MongoServerError') {
          console.error('💡 Tip: MongoDB server error - check cluster status in MongoDB Atlas');
        }
        
        cachedConnection = null; // Reset on error so we can retry
        throw err;
      });
  }

  return cachedConnection;
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error event:', err.message);
  cachedConnection = null; // Reset cache on error
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  cachedConnection = null; // Reset cache on disconnect
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Attempt initial connection (non-blocking for serverless)
if (MONGODB_URI) {
  connectDatabase().catch((err) => {
    console.error('❌ Failed to connect to MongoDB on startup:', err.message);
    console.error('This is normal for serverless - connection will be established on first request');
  });
} else {
  console.error('❌ MONGODB_URI not set - database connections will fail');
}

// Middleware to ensure MongoDB connection before handling requests
app.use(async (req, res, next) => {
  // Skip health check and root endpoint
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // Skip if MONGODB_URI is not configured
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured for request:', req.path);
    return res.status(503).json({ 
      message: 'Database not configured',
      error: 'MONGODB_URI environment variable is not set. Please configure it in Vercel dashboard.',
      help: 'See MONGODB_SETUP_GUIDE.md for setup instructions'
    });
  }

  try {
    // Ensure database is connected
    const connectionState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (connectionState !== 1) {
      if (connectionState === 0) {
        console.log('⏳ Database disconnected, attempting connection for:', req.path);
      } else if (connectionState === 2) {
        console.log('⏳ Database connection in progress for:', req.path);
      }
      
      // Wait for connection with timeout
      try {
        await Promise.race([
          connectDatabase(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 20000)
          )
        ]);
        console.log('✅ Database connected successfully for:', req.path);
      } catch (connError) {
        console.error('❌ Database connection failed for:', req.path);
        console.error('Connection error:', connError.message);
        
        // Provide helpful error message
        let errorMessage = 'Database connection failed';
        let helpText = 'Please check your MongoDB connection string and network access';
        
        if (connError.message.includes('authentication')) {
          errorMessage = 'Database authentication failed';
          helpText = 'Check your MongoDB username and password in MONGODB_URI';
        } else if (connError.message.includes('timeout')) {
          errorMessage = 'Database connection timeout';
          helpText = 'Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)';
        } else if (connError.message.includes('ENOTFOUND')) {
          errorMessage = 'Database host not found';
          helpText = 'Check your MongoDB cluster URL in MONGODB_URI';
        }
        
        return res.status(503).json({ 
          message: errorMessage,
          error: process.env.NODE_ENV === 'development' ? connError.message : undefined,
          help: helpText,
          connectionState: connectionState
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Unexpected error in database middleware:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
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




