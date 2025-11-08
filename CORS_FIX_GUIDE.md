# CORS Error Fix Guide

## Problem

You're seeing CORS errors like:
```
Access to XMLHttpRequest at 'https://nextcommbackend.vercel.app/api/auth/login' 
from origin 'https://next-comm-frontend-git-main-savitur-chauhans-projects.vercel.app' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 
'https://next-comm-frontend-alpha.vercel.app' that is not equal to the supplied origin.
```

## Root Cause

The backend's `FRONTEND_URL` environment variable is set to an old/incorrect URL (`https://next-comm-frontend-alpha.vercel.app`), but your actual frontend is deployed at a different URL (`https://next-comm-frontend-git-main-savitur-chauhans-projects.vercel.app`).

## Solution

We've updated the backend code to automatically support all Vercel preview deployments. However, you still need to update the `FRONTEND_URL` environment variable.

### Option 1: Update FRONTEND_URL to Match Your Production URL (Recommended)

1. **Find your production frontend URL**:
   - Go to Vercel Dashboard
   - Select your **frontend** project
   - Go to **Settings** → **Domains**
   - Look for your production domain (usually `project-name.vercel.app` or a custom domain)

2. **Update backend environment variable**:
   - Go to Vercel Dashboard
   - Select your **backend** project
   - Go to **Settings** → **Environment Variables**
   - Find `FRONTEND_URL`
   - Update it to your production frontend URL
   - Example: `https://next-comm-frontend.vercel.app` (or your custom domain)
   - Click **Save**

3. **Redeploy backend**:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment

### Option 2: Use Your Current Deployment URL

If you want to use the current preview deployment URL:

1. **Update `FRONTEND_URL`** in backend to:
   ```
   https://next-comm-frontend-git-main-savitur-chauhans-projects.vercel.app
   ```

2. **Redeploy backend**

**Note**: This URL will change with each deployment, so Option 1 is better for production.

## What We Fixed in the Code

The backend now automatically:
- ✅ Allows the exact `FRONTEND_URL` you specify
- ✅ Allows all `*.vercel.app` subdomains (for preview deployments)
- ✅ Allows `localhost:3000` and `localhost:3001` (for development)
- ✅ Logs blocked origins for debugging

This means:
- Your production frontend will work
- All Vercel preview deployments will work
- Local development will work

## Verification Steps

1. **Check backend logs** after redeploy:
   - Go to Vercel Dashboard → Backend Project → Deployments
   - Click on the latest deployment
   - Check the logs for: `✅ CORS: Added Vercel wildcard pattern for preview deployments`

2. **Test login**:
   - Open your frontend URL
   - Try to login
   - Check browser console (F12) - should see no CORS errors

3. **Check Network tab**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to login
   - Check the `/api/auth/login` request
   - Should see `200 OK` status (not CORS error)

## Quick Fix Summary

1. ✅ Code is already fixed (supports all Vercel deployments)
2. ⚠️ Update `FRONTEND_URL` in backend Vercel environment variables
3. ⚠️ Redeploy backend
4. ✅ Test login - should work now!

## Common Questions

### Q: Why do I see different frontend URLs?

**A**: Vercel creates different URLs for:
- **Production**: `project-name.vercel.app` (stable, doesn't change)
- **Preview deployments**: `project-name-git-branch-user.vercel.app` (changes with each deployment)

### Q: Which URL should I use for FRONTEND_URL?

**A**: Use your **production URL** (the stable one):
- `https://your-project.vercel.app`
- Or your custom domain if you have one

### Q: Will preview deployments work?

**A**: Yes! The code now automatically allows all `*.vercel.app` domains, so preview deployments will work automatically.

### Q: What if I still see CORS errors?

**A**: 
1. Verify `FRONTEND_URL` is set correctly in backend
2. Verify backend is redeployed
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check backend logs for CORS blocking messages
5. Verify the frontend URL in browser matches what you expect

## Environment Variables Checklist

### Backend (Vercel):
- [ ] `FRONTEND_URL` = Your production frontend URL (e.g., `https://next-comm-frontend.vercel.app`)
- [ ] `BACKEND_URL` = Your backend URL (e.g., `https://nextcommbackend.vercel.app`)
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Your JWT secret
- [ ] Other required variables...

### Frontend (Vercel):
- [ ] `REACT_APP_API_URL` = Your backend URL (e.g., `https://nextcommbackend.vercel.app`)

## After Fixing

Once you've updated `FRONTEND_URL` and redeployed:
- ✅ Login should work
- ✅ All API calls should work
- ✅ Google OAuth should work
- ✅ No more CORS errors

---

**Need Help?** Check the backend logs in Vercel for specific error messages.

