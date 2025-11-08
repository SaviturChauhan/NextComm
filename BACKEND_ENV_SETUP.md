# Backend Environment Variables Setup for Vercel

## Required Environment Variables

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority
```
- **Required**: Yes
- **Description**: MongoDB connection string
- **How to get**: MongoDB Atlas → Connect → Connection String

### 2. Authentication Secrets
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production
```
- **Required**: Yes
- **Description**: Secret keys for JWT tokens and sessions
- **Generate**: Use a random string generator (32+ characters)

### 3. Frontend URL
```
FRONTEND_URL=https://your-frontend.vercel.app
```
- **Required**: Yes
- **Description**: Your frontend deployment URL (no trailing slash)
- **Example**: `https://nextcomm-frontend.vercel.app`

### 4. Backend URL (for OAuth callback)
```
BACKEND_URL=https://your-backend.vercel.app
```
- **Required**: Yes (for Google OAuth)
- **Description**: Your backend deployment URL (no trailing slash)
- **Example**: `https://nextcomm-backend.vercel.app`
- **Note**: This is used to construct the OAuth callback URL

### 5. Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
```
- **Required**: Yes (if using Google Sign-In)
- **Description**: Google OAuth 2.0 credentials
- **How to get**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create/Select a project
  3. Enable Google+ API
  4. Create OAuth 2.0 credentials
  5. Add authorized redirect URI: `https://your-backend.vercel.app/api/auth/google/callback`

### 6. Gemini API (Optional - for AI features)
```
GEMINI_API_KEY=your-gemini-api-key
```
- **Required**: No
- **Description**: Google Gemini API key for AI features
- **How to get**: [Google AI Studio](https://makersuite.google.com/app/apikey)

## Setting Up in Vercel

### Step 1: Go to Your Backend Project
1. Open Vercel Dashboard
2. Select your **backend** project

### Step 2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - Click **Add New**
   - Enter **Key** and **Value**
   - Select **Environments** (Production, Preview, Development)
   - Click **Save**

### Step 3: Verify All Variables
Make sure you have all required variables:
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `SESSION_SECRET`
- ✅ `FRONTEND_URL`
- ✅ `BACKEND_URL`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_CALLBACK_URL` (or let it auto-construct from BACKEND_URL)

### Step 4: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://your-backend.vercel.app/api/auth/google/callback`
5. Click **Save**

### Step 5: Redeploy Backend
1. Go to **Deployments** tab
2. Click the **three dots** (⋮) on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

## Common Issues

### Issue: "JWT_SECRET is not configured"
**Solution**: Add `JWT_SECRET` environment variable in Vercel

### Issue: "MongoDB connection error"
**Solution**: 
1. Verify `MONGODB_URI` is set correctly
2. Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
3. Verify database user has correct permissions

### Issue: "Google OAuth callback URL mismatch"
**Solution**:
1. Verify `BACKEND_URL` is set to your backend deployment URL
2. Verify `GOOGLE_CALLBACK_URL` matches the URL in Google Cloud Console
3. Make sure there are no trailing slashes

### Issue: "CORS error"
**Solution**:
1. Verify `FRONTEND_URL` is set correctly in backend
2. Make sure frontend URL matches exactly (no trailing slash)
3. Redeploy backend after updating `FRONTEND_URL`

### Issue: "Session not working"
**Solution**:
1. Verify `SESSION_SECRET` is set
2. In production, sessions use secure cookies (HTTPS required)
3. Make sure `NODE_ENV=production` is set (auto-set by Vercel)

## Verification

### Test Backend Health
```bash
curl https://your-backend.vercel.app/api/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Test Login Endpoint
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Check Backend Logs
1. Go to Vercel Dashboard
2. Select your backend project
3. Go to **Deployments** → Select deployment → **Functions** tab
4. Click on a function to see logs

## Important Notes

1. **Never commit `.env` files** to Git
2. **Use different secrets** for production and development
3. **Rotate secrets** periodically for security
4. **Backend URL** must be the full URL (with `https://`)
5. **No trailing slashes** in URLs
6. **Environment variables** are case-sensitive
7. **Redeploy** after changing environment variables

## Environment Variable Template

Copy this template and fill in your values:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
SESSION_SECRET=your-super-secret-session-key-min-32-characters-long

# URLs
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback

# AI (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

