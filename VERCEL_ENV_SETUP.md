# Vercel Environment Variables Setup Guide

## Problem
After deployment, the frontend cannot communicate with the backend because they are on different domains. The frontend needs to know the backend URL to make API calls.

## Solution
Set the `REACT_APP_API_URL` environment variable in your Vercel frontend project to point to your backend deployment URL.

## Steps to Fix

### 1. Get Your Backend Deployment URL
- Go to your Vercel dashboard
- Select your **backend** project
- Copy the deployment URL (e.g., `https://your-backend.vercel.app`)
- **Important**: Do NOT include a trailing slash (`/`)

### 2. Set Environment Variable in Frontend Project
1. Go to your Vercel dashboard
2. Select your **frontend** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.vercel.app`)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

### 3. Redeploy Frontend
After adding the environment variable:
1. Go to your frontend project in Vercel
2. Go to **Deployments** tab
3. Click the **three dots** (⋮) on the latest deployment
4. Select **Redeploy**
5. Wait for the deployment to complete

## Verification

### Check Environment Variable
1. In Vercel, go to your frontend project
2. Settings → Environment Variables
3. Verify `REACT_APP_API_URL` is set correctly

### Test the Fix
1. Open your frontend URL in a browser
2. Try to login or register
3. Check browser console (F12) for any errors
4. Check Network tab to see if API calls are going to the correct backend URL

## Common Issues

### Issue: Still getting CORS errors
**Solution**: Make sure your backend has the correct `FRONTEND_URL` environment variable set:
- Backend project → Settings → Environment Variables
- `FRONTEND_URL` should be your frontend deployment URL
- Redeploy backend after updating

### Issue: API calls still failing
**Solution**: 
1. Verify `REACT_APP_API_URL` is set correctly (no trailing slash)
2. Check browser console for the actual URL being called
3. Verify backend is running and accessible
4. Check backend logs for errors

### Issue: Environment variable not working
**Solution**:
1. Make sure the variable name is exactly `REACT_APP_API_URL` (React requires `REACT_APP_` prefix)
2. Redeploy the frontend after adding the variable
3. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Example Configuration

### Frontend Environment Variables (Vercel)
```
REACT_APP_API_URL=https://nextcomm-backend.vercel.app
```

### Backend Environment Variables (Vercel)
```
FRONTEND_URL=https://nextcomm-frontend.vercel.app
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://nextcomm-backend.vercel.app/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
```

## Notes
- Environment variables starting with `REACT_APP_` are automatically available in React apps
- Changes to environment variables require a redeploy to take effect
- Never commit `.env` files with sensitive data to Git
- Use Vercel's environment variable UI for production secrets

