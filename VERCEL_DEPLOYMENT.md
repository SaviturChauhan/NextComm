# NextComm Vercel Deployment Guide

Complete guide to deploy NextComm on Vercel (Frontend + Backend).

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Architecture](#deployment-architecture)
- [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
- [Step 2: Backend Deployment on Vercel](#step-2-backend-deployment-on-vercel)
- [Step 3: Frontend Deployment on Vercel](#step-3-frontend-deployment-on-vercel)
- [Step 4: Environment Variables](#step-4-environment-variables)
- [Step 5: Testing](#step-5-testing)
- [Troubleshooting](#troubleshooting)

## Overview

Vercel is an excellent platform for deploying both frontend and backend. This guide covers:
- ✅ Frontend deployment (React app)
- ✅ Backend deployment (Express.js API)
- ✅ Serverless functions configuration
- ✅ Environment variables setup
- ✅ Custom domain configuration

## Prerequisites

Before starting, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ MongoDB Atlas account
- ✅ Node.js installed locally (for testing)

## Deployment Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
│   nextcomm.vercel.app
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Backend      │
│   (Vercel      │
│   Serverless)   │
│   api.vercel.app
└────────┬────────┘
         │
         │ Database
         │
┌────────▼────────┐
│   MongoDB       │
│   Atlas         │
└─────────────────┘
```

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### 1.2 Create a Cluster

1. Log in to MongoDB Atlas
2. Click **"Build a Database"**
3. Choose **FREE (M0)** tier
4. Select a cloud provider and region
5. Click **"Create"** (takes 3-5 minutes)

### 1.3 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set user privileges to **"Atlas Admin"**
6. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `nextcomm`

**Example:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nextcomm?retryWrites=true&w=majority
```

## Step 2: Backend Deployment on Vercel

### 2.1 Prepare Backend for Vercel

Vercel uses serverless functions, so we need to create a serverless entry point.

#### Create `backend/api/index.js`

Create a new file `backend/api/index.js`:

```javascript
// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('../config/passport');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Session configuration for OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again later.' }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Export for Vercel serverless
module.exports = app;
```

#### Create `backend/vercel.json`

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2.2 Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 2.3 Deploy Backend to Vercel

#### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select your NextComm repository
   - Click "Import"
4. **Configure Project Settings:**
   - **Project Name**: `nextcomm-backend`
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. **Add Environment Variables** (see Step 4)
6. **Click "Deploy"**

#### Method 2: Using Vercel CLI

```bash
cd backend
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **nextcomm-backend**
- Directory? **./**
- Override settings? **No**

### 2.4 Get Backend URL

After deployment, Vercel provides a URL like:
```
https://nextcomm-backend.vercel.app
```

**Save this URL** - you'll need it for frontend configuration.

## Step 3: Frontend Deployment on Vercel

### 3.1 Deploy Frontend

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your GitHub repository** (same repo)
4. **Configure Project Settings:**
   - **Project Name**: `nextcomm-frontend` (or `nextcomm`)
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
5. **Add Environment Variables:**
   ```
   REACT_APP_API_URL=https://nextcomm-backend.vercel.app
   ```
   (Use your actual backend URL from Step 2.4)
6. **Click "Deploy"**

### 3.2 Get Frontend URL

After deployment, Vercel provides a URL like:
```
https://nextcomm-frontend.vercel.app
```

### 3.3 Update Backend CORS

1. Go to your backend project in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update or add:
   ```
   FRONTEND_URL=https://nextcomm-frontend.vercel.app
   ```
4. **Redeploy** the backend (Vercel will auto-redeploy)

## Step 4: Environment Variables

### Backend Environment Variables

In your **backend project** on Vercel, go to **Settings** → **Environment Variables** and add:

```env
# Server Configuration
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nextcomm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-session-secret-minimum-32-characters

# Frontend URL (for CORS)
FRONTEND_URL=https://nextcomm-frontend.vercel.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://nextcomm-backend.vercel.app/api/auth/google/callback

# Gemini API (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend Environment Variables

In your **frontend project** on Vercel, go to **Settings** → **Environment Variables** and add:

```env
REACT_APP_API_URL=https://nextcomm-backend.vercel.app
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Testing

### 5.1 Test Backend

```bash
# Test health endpoint
curl https://nextcomm-backend.vercel.app/api/health

# Test questions endpoint
curl https://nextcomm-backend.vercel.app/api/questions
```

### 5.2 Test Frontend

1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test question creation
5. Test all major features

### 5.3 Create Admin User

You can create an admin user by:

1. **Using MongoDB Atlas Compass:**
   - Connect to your cluster
   - Find your user document
   - Update: `{ role: "ADMIN" }`

2. **Or create a temporary script:**
   ```javascript
   // Run this in MongoDB Atlas shell or Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "ADMIN" } }
   )
   ```

## Troubleshooting

### Issue: Backend not working / 404 errors

**Solution:**
- Ensure `backend/api/index.js` exists
- Check `backend/vercel.json` configuration
- Verify routes are correct
- Check Vercel function logs

### Issue: CORS errors

**Solution:**
- Verify `FRONTEND_URL` is set correctly in backend
- Ensure frontend URL matches exactly (no trailing slash)
- Redeploy backend after changing environment variables

### Issue: MongoDB connection failed

**Solution:**
- Verify MongoDB connection string
- Check network access in MongoDB Atlas
- Ensure IP 0.0.0.0/0 is whitelisted
- Check MongoDB Atlas logs

### Issue: Environment variables not working

**Solution:**
- Environment variables must be set in Vercel dashboard
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)
- For frontend: variables must start with `REACT_APP_`

### Issue: Build fails

**Solution:**
- Check build logs in Vercel dashboard
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check for missing dependencies
- Verify build commands are correct

### Issue: 404 on page refresh (SPA routing)

**Solution:**
- The `vercel.json` in frontend should handle this automatically
- If not, ensure `vercel.json` has the rewrite rule:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

## Alternative: Single Project Deployment

If you want to deploy both frontend and backend in one Vercel project:

### Option: Monorepo Setup

1. Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

2. Update frontend `package.json`:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "npm install && npm run build"
  }
}
```

3. Deploy as single project

## Custom Domain Setup

### Add Custom Domain

1. Go to your project in Vercel
2. Go to **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in backend environment variables

## Performance Optimization

### 1. Enable Caching

Add to `backend/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

### 2. Optimize Build

- Use Vercel's automatic optimizations
- Enable Edge Functions for static content
- Use CDN for assets

## Monitoring

### Vercel Analytics

1. Go to project settings
2. Enable Vercel Analytics
3. Monitor performance and errors

### Logs

- View function logs in Vercel dashboard
- Check deployment logs
- Monitor API response times

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Backend `api/index.js` created
- [ ] Backend `vercel.json` created
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] CORS configured correctly
- [ ] Health check endpoint working
- [ ] All features tested
- [ ] Admin user created
- [ ] Custom domain configured (optional)

## Quick Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel

# Deploy frontend
cd frontend
vercel

# View deployments
vercel ls

# View logs
vercel logs
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [Vercel GitHub](https://github.com/vercel/vercel)

---

**Happy Deploying on Vercel! 🚀**









