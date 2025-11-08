# NextComm Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### MongoDB Atlas

- [ ] MongoDB Atlas account created
- [ ] Cluster created (FREE M0 tier is sufficient)
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0 for development, specific IPs for production)
- [ ] Connection string copied and tested
- [ ] Database name decided (`nextcomm` or custom)

### Backend Preparation

- [ ] Backend code tested locally
- [ ] All environment variables documented
- [ ] `package.json` has `engines` field
- [ ] `server.js` uses `FRONTEND_URL` for CORS
- [ ] Health check endpoint works (`/api/health`)
- [ ] All routes tested
- [ ] Error handling verified

### Frontend Preparation

- [ ] Frontend code tested locally
- [ ] Build process works (`npm run build`)
- [ ] `_redirects` file created for Netlify
- [ ] `vercel.json` created for Vercel (if using)
- [ ] All API calls use environment variables
- [ ] Google OAuth callback URLs updated (if using)

### Security

- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] Strong SESSION_SECRET generated (32+ characters)
- [ ] MongoDB password is strong
- [ ] All secrets stored securely (not in code)
- [ ] Environment variables ready

## Backend Deployment

### Platform Setup

- [ ] Backend hosting account created (Railway/Heroku/Render)
- [ ] Project created on hosting platform
- [ ] GitHub repository connected (if using)
- [ ] Build settings configured:
  - [ ] Root directory: `backend`
  - [ ] Build command: `npm install`
  - [ ] Start command: `npm start`

### Environment Variables Set

- [ ] `PORT` (usually auto-set by platform)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` (with password and database name)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `SESSION_SECRET` (strong random string)
- [ ] `FRONTEND_URL` (will update after frontend deployment)
- [ ] `GOOGLE_CLIENT_ID` (if using Google OAuth)
- [ ] `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
- [ ] `GOOGLE_CALLBACK_URL` (if using Google OAuth)
- [ ] `GEMINI_API_KEY` (if using AI features)

### Backend Deployment

- [ ] Backend deployed successfully
- [ ] Backend URL obtained (e.g., `https://your-app.railway.app`)
- [ ] Health check endpoint accessible (`/api/health`)
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Logs checked for errors

## Frontend Deployment

### Platform Setup

- [ ] Frontend hosting account created (Netlify/Vercel)
- [ ] Project created on hosting platform
- [ ] GitHub repository connected (if using)
- [ ] Build settings configured:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm install && npm run build`
  - [ ] Publish directory: `frontend/build`

### Environment Variables Set

- [ ] `REACT_APP_API_URL` (backend URL from previous step)

### Frontend Deployment

- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained (e.g., `https://nextcomm.netlify.app`)
- [ ] Site loads correctly
- [ ] No console errors
- [ ] SPA routing works (no 404 on refresh)

## Post-Deployment Configuration

### Update Backend

- [ ] Update `FRONTEND_URL` in backend environment variables
- [ ] Restart backend (to apply CORS changes)
- [ ] Verify CORS working (no CORS errors in browser)

### Google OAuth (if using)

- [ ] Google Cloud project created
- [ ] OAuth credentials created
- [ ] Authorized JavaScript origins added:
  - [ ] Frontend URL
  - [ ] `http://localhost:3000` (for local dev)
- [ ] Authorized redirect URIs added:
  - [ ] `https://your-backend-url/api/auth/google/callback`
  - [ ] `http://localhost:5001/api/auth/google/callback` (for local dev)
- [ ] `GOOGLE_CLIENT_ID` updated in backend
- [ ] `GOOGLE_CLIENT_SECRET` updated in backend
- [ ] `GOOGLE_CALLBACK_URL` updated in backend
- [ ] Google OAuth tested in production

### Gemini API (if using)

- [ ] Google AI Studio account created
- [ ] API key generated
- [ ] `GEMINI_API_KEY` added to backend
- [ ] AI features tested in production

### Admin User

- [ ] Admin user created (using script or manual)
- [ ] Admin dashboard accessible
- [ ] Admin features tested

## Testing

### Functionality Tests

- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works (if enabled)
- [ ] Question creation works
- [ ] Answer posting works
- [ ] Voting works
- [ ] Answer acceptance works
- [ ] Search and filters work
- [ ] Bookmarks work
- [ ] Notifications work
- [ ] Profile editing works
- [ ] Leaderboard displays correctly
- [ ] Admin dashboard works (if admin)

### Performance Tests

- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Images load correctly
- [ ] No memory leaks
- [ ] Database queries optimized

### Security Tests

- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS configured correctly
- [ ] Authentication required for protected routes
- [ ] Admin routes protected
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] XSS protection working

### Browser Compatibility

- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

## Monitoring & Maintenance

### Monitoring Setup

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Log aggregation setup (if needed)
- [ ] Performance monitoring (if needed)

### Backup Strategy

- [ ] Database backup strategy defined
- [ ] Environment variables backed up
- [ ] Backup schedule set (if using paid MongoDB tier)

### Documentation

- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Team access configured (if team project)

## Final Checks

- [ ] All features working in production
- [ ] No console errors
- [ ] No server errors in logs
- [ ] Database connection stable
- [ ] Environment variables secure
- [ ] SSL certificates active
- [ ] Custom domain configured (if using)
- [ ] DNS configured correctly (if using custom domain)
- [ ] Team members have access (if team project)
- [ ] Documentation updated

## Post-Launch

### Immediate (First 24 hours)

- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Check user registrations
- [ ] Verify all features working
- [ ] Test on multiple devices

### Short-term (First week)

- [ ] Monitor user feedback
- [ ] Check analytics
- [ ] Review error logs
- [ ] Optimize performance if needed
- [ ] Fix any bugs discovered

### Long-term (Ongoing)

- [ ] Regular backups
- [ ] Security updates
- [ ] Performance optimization
- [ ] Feature updates
- [ ] User support

## Troubleshooting

If you encounter issues, check:

1. **Backend not starting**

   - Check environment variables
   - Check MongoDB connection
   - Check logs on hosting platform

2. **Frontend not loading**

   - Check build process
   - Check environment variables
   - Check browser console

3. **CORS errors**

   - Verify `FRONTEND_URL` in backend
   - Check CORS configuration
   - Restart backend after changes

4. **Database connection failed**

   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas
   - Verify credentials

5. **Google OAuth not working**
   - Check redirect URIs in Google Cloud Console
   - Verify environment variables
   - Check callback URL

## Support Resources

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [README.md](./README.md) - Project documentation
- Hosting platform documentation
- MongoDB Atlas documentation

---

**✅ Deployment Complete!**

Once all items are checked, your NextComm application should be live and working in production.
