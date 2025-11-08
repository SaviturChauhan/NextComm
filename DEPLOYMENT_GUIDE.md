# NextComm Deployment Guide

Complete step-by-step guide to deploy NextComm to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Architecture](#deployment-architecture)
- [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
- [Step 2: Backend Deployment](#step-2-backend-deployment)
- [Step 3: Frontend Deployment](#step-3-frontend-deployment)
- [Step 4: Environment Variables](#step-4-environment-variables)
- [Step 5: Google OAuth Setup (Optional)](#step-5-google-oauth-setup-optional)
- [Step 6: Gemini API Setup (Optional)](#step-6-gemini-api-setup-optional)
- [Step 7: Domain Configuration (Optional)](#step-7-domain-configuration-optional)
- [Step 8: Testing Production](#step-8-testing-production)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account (recommended)
- ✅ MongoDB Atlas account (free tier available)
- ✅ Heroku/Railway/Render account (for backend)
- ✅ Netlify/Vercel account (for frontend)
- ✅ Google Cloud account (for OAuth - optional)
- ✅ Google AI Studio account (for Gemini API - optional)

## Deployment Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Netlify/      │
│   Vercel)       │
│  Port: 3000     │
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Backend       │
│  (Heroku/       │
│   Railway/      │
│   Render)       │
│  Port: 5001     │
└────────┬────────┘
         │
         │ Database Queries
         │
┌────────▼────────┐
│   MongoDB       │
│   Atlas         │
│  (Cloud)        │
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
4. Select a cloud provider and region (closest to your users)
5. Click **"Create"**

### 1.3 Configure Database Access

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set user privileges to **"Atlas Admin"** (for development) or create custom role
6. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0) for development
   - **For production**: Add specific IPs of your hosting services
4. Click **"Confirm"**

### 1.5 Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `nextcomm` (or your preferred database name)

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nextcomm?retryWrites=true&w=majority
```

## Step 2: Backend Deployment

Choose one of the following platforms:

### Option A: Railway (Recommended - Easiest)

#### 2.1 Create Railway Account

1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Verify your email

#### 2.2 Deploy Backend

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account (if not connected)
4. Select your NextComm repository
5. Railway will auto-detect Node.js

#### 2.3 Configure Build Settings

1. In your project settings, set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### 2.4 Set Environment Variables

Go to **"Variables"** tab and add:

```env
PORT=5001
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
SESSION_SECRET=your_session_secret_here
FRONTEND_URL=https://your-frontend-domain.netlify.app
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
GEMINI_API_KEY=your_gemini_api_key (optional)
```

#### 2.5 Get Backend URL

1. After deployment, Railway provides a URL like:
   ```
   https://your-app-name.up.railway.app
   ```
2. Copy this URL - you'll need it for frontend configuration

---

### Option B: Render

#### 2.1 Create Render Account

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Verify your email

#### 2.2 Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your NextComm repository

#### 2.3 Configure Service

- **Name**: `nextcomm-backend`
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid for production)

#### 2.4 Set Environment Variables

In **"Environment"** section, add all environment variables (same as Railway)

#### 2.5 Get Backend URL

Render provides a URL like:
```
https://nextcomm-backend.onrender.com
```

---

### Option C: Heroku

#### 2.1 Create Heroku Account

1. Go to [Heroku](https://www.heroku.com/)
2. Sign up for free account
3. Verify your email

#### 2.2 Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2.3 Login to Heroku

```bash
heroku login
```

#### 2.4 Create Heroku App

```bash
cd backend
heroku create nextcomm-backend
```

#### 2.5 Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_super_secret_jwt_key
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.netlify.app
```

#### 2.6 Deploy to Heroku

```bash
# Initialize git if not already done
git init

# Add Heroku remote
heroku git:remote -a nextcomm-backend

# Deploy
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 2.7 Update package.json

Ensure your `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

---

## Step 3: Frontend Deployment

### Option A: Netlify (Recommended)

#### 3.1 Create Netlify Account

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub
3. Verify your email

#### 3.2 Build Frontend Locally (First Time)

```bash
cd frontend
npm install
npm run build
```

This creates a `build` folder.

#### 3.3 Deploy to Netlify

**Method 1: Drag and Drop (Quick Start)**

1. Go to Netlify dashboard
2. Drag the `frontend/build` folder to Netlify
3. Your site will be deployed!

**Method 2: GitHub Integration (Recommended)**

1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to GitHub
3. Select your NextComm repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`

#### 3.4 Set Environment Variables

1. Go to **"Site settings"** → **"Environment variables"**
2. Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
   (Use your actual backend URL from Step 2)

#### 3.5 Get Frontend URL

Netlify provides a URL like:
```
https://nextcomm.netlify.app
```

#### 3.6 Update Backend CORS Settings

Update your backend `server.js` to allow your Netlify domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://nextcomm.netlify.app' 
    : 'http://localhost:3000',
  credentials: true
}));
```

Or use environment variable:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

### Option B: Vercel

#### 3.1 Create Vercel Account

1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Verify your email

#### 3.2 Deploy Frontend

1. Click **"Add New Project"**
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

#### 3.3 Set Environment Variables

1. Go to **"Settings"** → **"Environment Variables"**
2. Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

#### 3.4 Deploy

Click **"Deploy"** and wait for build to complete.

---

## Step 4: Environment Variables

### Backend Environment Variables

Update your backend hosting platform with these variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nextcomm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=generate_a_random_string_here_minimum_32_characters
SESSION_SECRET=generate_another_random_string_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.netlify.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback

# Gemini API (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Environment Variables

Update your frontend hosting platform with:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Generate Secure Secrets

For `JWT_SECRET` and `SESSION_SECRET`, generate random strings:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Step 5: Google OAuth Setup (Optional)

### 5.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** (or Google Identity Services)

### 5.2 Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Configure OAuth consent screen (if first time)
4. Select **"Web application"**
5. Add authorized JavaScript origins:
   ```
   https://your-frontend-domain.netlify.app
   http://localhost:3000 (for local development)
   ```
6. Add authorized redirect URIs:
   ```
   https://your-backend-url.railway.app/api/auth/google/callback
   http://localhost:5001/api/auth/google/callback (for local development)
   ```
7. Copy **Client ID** and **Client Secret**

### 5.3 Update Environment Variables

Add to your backend environment variables:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback
```

### 5.4 Update Frontend

Update `frontend/src/pages/Login.js` and `Register.js`:

```javascript
onClick={() => {
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  window.location.href = `${backendUrl}/api/auth/google`;
}}
```

## Step 6: Gemini API Setup (Optional)

### 6.1 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click **"Create API Key"**
4. Copy the API key

### 6.2 Update Environment Variables

Add to your backend environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 7: Domain Configuration (Optional)

### 7.1 Custom Domain on Netlify

1. Go to **"Domain settings"** in Netlify
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in backend environment variables

### 7.2 Custom Domain on Backend

1. In Railway/Render/Heroku, add custom domain
2. Update CORS settings in backend
3. Update Google OAuth redirect URIs

## Step 8: Testing Production

### 8.1 Test Backend

```bash
# Test backend health
curl https://your-backend-url.railway.app/api/health

# Test API endpoint
curl https://your-backend-url.railway.app/api/questions
```

### 8.2 Test Frontend

1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test question creation
5. Test answer posting
6. Test all major features

### 8.3 Create Admin User

SSH into your backend or use Railway/Render shell:

```bash
# On Railway/Render, use their web shell or SSH
cd backend
npm run create-admin
```

Or manually update MongoDB:

```javascript
// In MongoDB Atlas Compass or shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Troubleshooting

### Backend Issues

#### Issue: Backend not starting
**Solution:**
- Check environment variables are set correctly
- Check MongoDB connection string
- Check logs in hosting platform
- Ensure `PORT` is set correctly (some platforms use `PORT` env var automatically)

#### Issue: CORS errors
**Solution:**
- Update `FRONTEND_URL` in backend environment variables
- Update CORS configuration in `server.js`
- Ensure frontend URL matches exactly (no trailing slash)

#### Issue: Database connection failed
**Solution:**
- Verify MongoDB connection string
- Check network access in MongoDB Atlas (add 0.0.0.0/0 for development)
- Verify database user credentials
- Check if IP is whitelisted

### Frontend Issues

#### Issue: API calls failing
**Solution:**
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS configuration on backend
- Check browser console for errors
- Verify backend URL is accessible

#### Issue: Build fails
**Solution:**
- Check Node.js version (should be 14+)
- Check for missing dependencies
- Review build logs
- Ensure all environment variables are set

#### Issue: Environment variables not working
**Solution:**
- Environment variables must start with `REACT_APP_` in Create React App
- Rebuild after changing environment variables
- Clear browser cache

### Common Deployment Issues

#### Issue: 404 errors on refresh (SPA routing)
**Solution (Netlify):**
Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

**Solution (Vercel):**
Create `vercel.json` in frontend:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Issue: Static assets not loading
**Solution:**
- Check `package.json` has `"homepage": "."` (for Netlify)
- Or set `"homepage": "https://your-domain.com"` for custom domain
- Rebuild after changes

## Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (IP whitelist)
- [ ] Backend deployed and accessible
- [ ] Backend environment variables set
- [ ] Frontend deployed and accessible
- [ ] Frontend environment variables set
- [ ] CORS configured correctly
- [ ] Google OAuth configured (if using)
- [ ] Gemini API configured (if using)
- [ ] Admin user created
- [ ] All features tested in production
- [ ] Custom domain configured (if using)
- [ ] SSL certificates active (automatic on most platforms)
- [ ] Error logging/monitoring set up

## Post-Deployment

### 1. Set Up Monitoring

- Enable error tracking (Sentry, LogRocket, etc.)
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure alerts for downtime

### 2. Set Up Backups

- MongoDB Atlas has automatic backups (paid tiers)
- Export database regularly for free tier
- Backup environment variables securely

### 3. Performance Optimization

- Enable CDN for static assets
- Optimize images
- Enable compression
- Use caching strategies

### 4. Security Hardening

- Use strong JWT secrets
- Enable rate limiting
- Set up firewall rules
- Regular security updates
- Use HTTPS only

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review hosting platform logs
3. Check MongoDB Atlas logs
4. Review browser console errors
5. Create an issue in the repository

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**Happy Deploying! 🚀**

