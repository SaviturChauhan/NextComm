// Load environment variables FIRST before anything else
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');

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

// Session configuration for OAuth (only needed if Google OAuth is enabled)
// Check if Google OAuth is configured before setting up session
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 in production, 1000 in development
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only to API routes, not static files
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextcomm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/unanswered', require('./routes/unanswered'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check for required environment variables
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set in .env file');
  }
  
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  WARNING: MONGODB_URI is not set in .env file');
  }
  
  // Google OAuth status
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth is configured');
  } else {
    console.log('ℹ️  Google OAuth is not configured (optional)');
    console.log('   To enable Google Sign-In, add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
  }
});

