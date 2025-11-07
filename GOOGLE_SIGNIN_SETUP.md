# Google Sign-In Setup Guide

This guide will walk you through setting up Google OAuth authentication for NextComm.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Your backend server running on `http://localhost:5001` (or your configured port)
- Your frontend running on `http://localhost:3000` (or your configured port)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "NextComm")
5. Click **"Create"**

## Step 2: Enable Google+ API

1. In your Google Cloud project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on it and click **"Enable"**

**Note:** Google+ API is deprecated, but we're using it for OAuth. Alternatively, you can use the newer Google Identity Services, but for simplicity, we'll use the OAuth 2.0 credentials.

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** (unless you have a Google Workspace)
   - Fill in the required fields:
     - **App name**: NextComm
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **"Save and Continue"**
   - On **"Scopes"**, click **"Save and Continue"**
   - On **"Test users"**, add your email if needed, then click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

5. Now create the OAuth client:
   - **Application type**: Web application
   - **Name**: NextComm Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `http://localhost:5001` (backend)
     - Add your production URLs when deploying
   - **Authorized redirect URIs**:
     - `http://localhost:5001/api/auth/google/callback` (for development)
     - Add your production callback URL when deploying (e.g., `https://yourdomain.com/api/auth/google/callback`)
   - Click **"Create"**

6. **Copy your Client ID and Client Secret** - You'll need these for your `.env` file

## Step 4: Configure Backend Environment Variables

Add the following to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Session Secret (use a strong random string)
SESSION_SECRET=your-session-secret-here
```

**Important Notes:**
- Replace `your-client-id-here` and `your-client-secret-here` with the actual values from Google Cloud Console
- For production, update `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` to your production URLs
- Generate a strong `SESSION_SECRET` (you can use: `openssl rand -base64 32`)

## Step 5: Install Dependencies

The dependencies should already be installed, but if not, run:

```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

## Step 6: Restart Your Backend Server

After adding the environment variables, restart your backend server:

```bash
cd backend
npm run dev
```

## Step 7: Test Google Sign-In

1. Start your frontend (if not already running):
   ```bash
   cd frontend
   npm start
   ```

2. Navigate to `http://localhost:3000/login` or `http://localhost:3000/register`

3. Click the **"Sign in with Google"** or **"Sign up with Google"** button

4. You should be redirected to Google's sign-in page

5. After signing in, you should be redirected back to your app and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in your Google Cloud Console exactly matches `http://localhost:5001/api/auth/google/callback`
- Check for trailing slashes or protocol mismatches (http vs https)

### Error: "invalid_client"
- **Solution**: Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the `.env` file are correct
- Make sure there are no extra spaces or quotes

### Error: "access_denied"
- **Solution**: Check that your OAuth consent screen is properly configured
- If in testing mode, make sure your email is added as a test user

### CORS Errors
- **Solution**: Make sure your backend CORS configuration includes your frontend URL
- Check `backend/server.js` for CORS settings

### Session Issues
- **Solution**: Make sure `SESSION_SECRET` is set in your `.env` file
- Clear your browser cookies and try again

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add your production domain to **Authorized JavaScript origins**
   - Add your production callback URL to **Authorized redirect URIs**
   - Example: `https://yourdomain.com/api/auth/google/callback`

2. **Update Environment Variables:**
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

3. **Update Frontend:**
   - Set `REACT_APP_API_URL` to your production backend URL
   - Or update the proxy in `package.json` if using a proxy

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong session secrets** in production
3. **Enable HTTPS** in production
4. **Regularly rotate** your OAuth credentials
5. **Monitor** OAuth usage in Google Cloud Console

## Additional Providers

To add more OAuth providers (GitHub, LinkedIn, etc.):

1. Follow similar steps for each provider
2. Install the corresponding Passport strategy (e.g., `passport-github2`)
3. Add routes in `backend/routes/auth.js`
4. Update the frontend with new sign-in buttons

## Support

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud Console configuration matches your setup
4. Check that both frontend and backend servers are running

---

**Note:** This implementation uses Passport.js with Google OAuth 2.0. The authentication flow:
1. User clicks "Sign in with Google"
2. Redirects to Google's OAuth page
3. User authorizes the app
4. Google redirects back to your backend callback
5. Backend creates/updates user and generates JWT token
6. Frontend receives token and logs user in

