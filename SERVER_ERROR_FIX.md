# Server Error (500) Fix Guide

## Problem

You're seeing 500 Internal Server Error when trying to login or access API endpoints.

## Common Causes

1. **Missing Environment Variables** (Most Common)
   - `MONGODB_URI` not set
   - `JWT_SECRET` not set
   - Other required variables missing

2. **Database Connection Issues**
   - MongoDB URI incorrect
   - Network/firewall blocking connection
   - Database server down

3. **Serverless Function Timeout**
   - Database connection taking too long
   - Cold start issues

## Fix Steps

### Step 1: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard**
2. Select your **backend** project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set:

#### Required Variables:
- ✅ `MONGODB_URI` - Your MongoDB connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
  - Or: `mongodb://username:password@host:port/database`
  
- ✅ `JWT_SECRET` - Secret key for JWT tokens
  - Should be a long random string
  - Example: `your-super-secret-jwt-key-change-this-in-production`

#### Optional but Recommended:
- `FRONTEND_URL` - Your frontend URL
- `BACKEND_URL` - Your backend URL
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `SESSION_SECRET` - For session management

### Step 2: Check MongoDB Connection String

Your `MONGODB_URI` should look like:

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

**MongoDB Local/Other:**
```
mongodb://username:password@host:port/database-name
```

**Common Issues:**
- ❌ Missing username/password
- ❌ Incorrect cluster name
- ❌ Missing database name
- ❌ Special characters in password not URL-encoded
- ❌ Network access not allowed in MongoDB Atlas

### Step 3: Verify MongoDB Atlas Network Access

If using MongoDB Atlas:

1. Go to **MongoDB Atlas Dashboard**
2. Click **Network Access** in left sidebar
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (for Vercel)
   - Or add Vercel's IP ranges
5. Wait 1-2 minutes for changes to propagate

### Step 4: Check Vercel Function Logs

1. Go to **Vercel Dashboard**
2. Select your **backend** project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **Functions** tab
6. Click on a function that's failing (e.g., `/api/auth/login`)
7. Check the logs for errors

**Look for:**
- `❌ ERROR: Missing required environment variables`
- `❌ MongoDB connection error`
- `❌ Database connection failed`
- `JWT_SECRET is not configured`

### Step 5: Test Database Connection

You can test your MongoDB connection string locally:

```bash
# Install MongoDB shell (if not installed)
# Then test connection:
mongosh "your-mongodb-uri-here"
```

Or use a MongoDB client like MongoDB Compass or Studio 3T.

### Step 6: Redeploy Backend

After fixing environment variables:

1. Go to **Vercel Dashboard**
2. Select your **backend** project
3. Go to **Deployments** tab
4. Click the **three dots (⋮)** on latest deployment
5. Click **Redeploy**
6. Wait for deployment to complete
7. Check logs for success messages:
   - `✅ MongoDB connected successfully`
   - `✅ CORS: Added Vercel wildcard pattern`

## Troubleshooting

### Error: "Database connection failed"

**Possible causes:**
1. `MONGODB_URI` not set or incorrect
2. MongoDB server is down
3. Network access blocked
4. Wrong credentials

**Solution:**
1. Verify `MONGODB_URI` in Vercel
2. Test connection string locally
3. Check MongoDB Atlas network access
4. Verify username/password

### Error: "JWT_SECRET is not configured"

**Solution:**
1. Go to Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Add `JWT_SECRET` with a random string value
3. Redeploy backend

### Error: "Server configuration error"

**Solution:**
1. Check all required environment variables are set
2. Verify values are correct (no typos)
3. Redeploy backend

### Error: Still getting 500 errors after fixing

**Check:**
1. Are environment variables set for the correct **Environment**?
   - Production
   - Preview
   - Development
2. Did you **Redeploy** after changing environment variables?
3. Check Vercel function logs for specific error messages
4. Verify MongoDB connection is working
5. Check if database has the required collections

## Quick Checklist

- [ ] `MONGODB_URI` is set in Vercel
- [ ] `JWT_SECRET` is set in Vercel
- [ ] MongoDB connection string is correct
- [ ] MongoDB Atlas network access allows all IPs (or Vercel IPs)
- [ ] Environment variables are set for **Production** environment
- [ ] Backend has been **Redeployed** after setting variables
- [ ] Checked Vercel function logs for errors
- [ ] Tested MongoDB connection locally (if possible)

## Verification

After fixing, test:

1. **Health Check:**
   ```
   GET https://your-backend.vercel.app/api/health
   ```
   Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Login:**
   - Try logging in through the frontend
   - Should not get 500 error
   - Check browser console for errors
   - Check Network tab for response

3. **Check Logs:**
   - Go to Vercel → Backend → Deployments → Latest → Functions
   - Should see: `✅ MongoDB connected successfully`
   - Should see: `Login successful for user: ...`

## Still Having Issues?

1. **Share Vercel Function Logs:**
   - Go to Vercel → Backend → Deployments → Latest → Functions
   - Copy the error logs
   - Share them for debugging

2. **Check MongoDB Atlas:**
   - Verify database is accessible
   - Check if collections exist
   - Verify user has read/write permissions

3. **Test Locally:**
   - Try running backend locally with same environment variables
   - See if same errors occur
   - This helps isolate if it's a Vercel-specific issue

---

**Need Help?** Check the Vercel function logs for specific error messages and share them for further debugging.

