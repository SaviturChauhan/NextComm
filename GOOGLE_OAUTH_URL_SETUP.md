# Google OAuth URL Configuration Guide

## Overview

When setting up Google OAuth in Google Cloud Console, you need to configure two types of URLs:
1. **Authorized JavaScript origins** - Where your frontend is hosted
2. **Authorized redirect URIs** - Where Google sends users after authentication (your backend)

## Step-by-Step Configuration

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (or create one if you don't have it)

### Step 2: Configure Authorized JavaScript Origins

**Purpose**: These are the domains from which your frontend can initiate Google Sign-In.

**What to add**:
- Your **frontend deployment URL** (where users access your website)
- Your **local development URL** (for testing)

#### For Production (Vercel):
```
https://your-frontend.vercel.app
```
Replace `your-frontend.vercel.app` with your actual frontend URL.

#### For Local Development:
```
http://localhost:3000
```
Keep this for local testing.

#### Example:
```
Authorized JavaScript origins:
├── http://localhost:3000          (for local development)
└── https://nextcomm-frontend.vercel.app  (your production frontend)
```

**Important Notes**:
- ✅ Must include `https://` for production
- ✅ Must include `http://` for localhost
- ✅ No trailing slash (`/`)
- ✅ No path after domain (just the base URL)
- ❌ Don't include `/api` or any other paths

### Step 3: Configure Authorized Redirect URIs

**Purpose**: These are the exact URLs where Google will send users after they authenticate. This must point to your backend's OAuth callback endpoint.

**What to add**:
- Your **backend OAuth callback URL** (production)
- Your **local backend callback URL** (for development)

#### For Production (Vercel):
```
https://your-backend.vercel.app/api/auth/google/callback
```
Replace `your-backend.vercel.app` with your actual backend URL.

#### For Local Development:
```
http://localhost:5001/api/auth/google/callback
```
Keep this for local testing.

#### Example:
```
Authorized redirect URIs:
├── http://localhost:5001/api/auth/google/callback  (for local development)
└── https://nextcomm-backend.vercel.app/api/auth/google/callback  (your production backend)
```

**Important Notes**:
- ✅ Must include the full path: `/api/auth/google/callback`
- ✅ Must include `https://` for production
- ✅ Must include `http://` for localhost
- ✅ Must match exactly what's in your backend code
- ✅ No trailing slash
- ❌ Don't forget the `/api/auth/google/callback` path

### Step 4: Save Changes

1. Click **Save** at the bottom of the page
2. Wait for changes to propagate (may take a few minutes)

## Complete Example Configuration

### If Your Frontend is: `https://nextcomm-frontend.vercel.app`
### If Your Backend is: `https://nextcomm-backend.vercel.app`

#### Authorized JavaScript origins:
```
http://localhost:3000
https://nextcomm-frontend.vercel.app
```

#### Authorized redirect URIs:
```
http://localhost:5001/api/auth/google/callback
https://nextcomm-backend.vercel.app/api/auth/google/callback
```

## Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Google Cloud Console - OAuth 2.0 Client ID Settings   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📍 Authorized JavaScript origins                      │
│  For use with requests from a browser                  │
│  ┌──────────────────────────────────────────────┐     │
│  │ http://localhost:3000                    [🗑️] │     │
│  └──────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────┐     │
│  │ https://your-frontend.vercel.app        [🗑️] │     │
│  └──────────────────────────────────────────────┘     │
│  [+ Add URI]                                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📍 Authorized redirect URIs                          │
│  For use with requests from a web server              │
│  ┌──────────────────────────────────────────────┐     │
│  │ http://localhost:5001/api/auth/google/       │     │
│  │ callback                                [🗑️] │     │
│  └──────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────┐     │
│  │ https://your-backend.vercel.app/api/auth/    │     │
│  │ google/callback                         [🗑️] │     │
│  └──────────────────────────────────────────────┘     │
│  [+ Add URI]                                           │
│                                                         │
│  [Save]                                                │
└─────────────────────────────────────────────────────────┘
```

## Quick Reference Table

| Setting | What to Add | Example |
|---------|-------------|---------|
| **Authorized JavaScript origins** | Frontend URL (no path) | `https://nextcomm-frontend.vercel.app` |
| **Authorized redirect URIs** | Backend callback URL (full path) | `https://nextcomm-backend.vercel.app/api/auth/google/callback` |

## Common Mistakes to Avoid

### ❌ Wrong: Trailing Slash
```
https://your-frontend.vercel.app/  ← Don't include trailing slash
```

### ❌ Wrong: Missing Path in Redirect URI
```
https://your-backend.vercel.app  ← Missing /api/auth/google/callback
```

### ❌ Wrong: Using HTTP in Production
```
http://your-frontend.vercel.app  ← Should be https://
```

### ❌ Wrong: Adding Frontend URL to Redirect URIs
```
https://your-frontend.vercel.app/api/auth/google/callback  ← Wrong! Use backend URL
```

### ✅ Correct: Production Frontend
```
https://your-frontend.vercel.app
```

### ✅ Correct: Production Backend Callback
```
https://your-backend.vercel.app/api/auth/google/callback
```

## Verification Checklist

After configuring, verify:

- [ ] **Authorized JavaScript origins** includes your frontend URL
- [ ] **Authorized redirect URIs** includes your backend callback URL
- [ ] All URLs use `https://` for production
- [ ] No trailing slashes
- [ ] Redirect URI includes the full path: `/api/auth/google/callback`
- [ ] Changes are saved
- [ ] Backend environment variables match:
  - `BACKEND_URL` = your backend URL
  - `FRONTEND_URL` = your frontend URL
  - `GOOGLE_CALLBACK_URL` = your backend callback URL (optional, auto-constructed)

## Testing

### Test Local Development:
1. Start your local backend: `cd backend && npm start`
2. Start your local frontend: `cd frontend && npm start`
3. Try Google Sign-In - should work with `localhost` URLs

### Test Production:
1. Deploy backend to Vercel
2. Deploy frontend to Vercel
3. Update Google Cloud Console with production URLs
4. Try Google Sign-In on deployed site - should work

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: Redirect URI in Google Console doesn't match what your backend is using.

**Solution**:
1. Check your backend's `GOOGLE_CALLBACK_URL` or `BACKEND_URL` environment variable
2. Verify it matches exactly what's in Google Cloud Console
3. Make sure there are no trailing slashes
4. Wait a few minutes after saving (changes may take time to propagate)

### Error: "origin_mismatch"
**Cause**: JavaScript origin not authorized.

**Solution**:
1. Verify your frontend URL is in "Authorized JavaScript origins"
2. Check that it matches exactly (including `https://`)
3. Clear browser cache and try again

### Still Not Working?
1. Double-check all URLs match exactly
2. Verify environment variables in Vercel
3. Redeploy backend after updating environment variables
4. Check backend logs in Vercel for specific error messages
5. Wait 5-10 minutes after saving in Google Console (propagation delay)

## Next Steps

After configuring URLs in Google Cloud Console:

1. ✅ Update backend environment variables in Vercel:
   - `BACKEND_URL` = your backend URL
   - `FRONTEND_URL` = your frontend URL
   - `GOOGLE_CALLBACK_URL` = your backend callback URL (optional)

2. ✅ Update frontend environment variables in Vercel:
   - `REACT_APP_API_URL` = your backend URL

3. ✅ Redeploy both backend and frontend

4. ✅ Test Google Sign-In on deployed site

## Summary

**Authorized JavaScript origins** = Frontend URL (where users visit your site)
**Authorized redirect URIs** = Backend callback URL (where Google sends auth response)

Both should include:
- Local development URLs (for testing)
- Production URLs (for deployed site)

Make sure to use `https://` for production and include the full callback path for redirect URIs!





