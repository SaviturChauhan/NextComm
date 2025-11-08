# Vercel Frontend Deployment Fix

## Problem
The error `react-scripts: command not found` occurs because Vercel is not installing dependencies correctly when deploying from a monorepo structure.

## Solution

There are two ways to fix this:

### Option 1: Configure Root Directory in Vercel Dashboard (Recommended)

1. **Go to your Vercel project dashboard**
2. **Go to Settings → General**
3. **Set Root Directory to `frontend`**
4. **Save changes**
5. **Redeploy**

This tells Vercel to treat the `frontend` folder as the project root, so it will:
- Install dependencies from `frontend/package.json`
- Run build commands from `frontend/` directory
- Use `frontend/build` as output directory

### Option 2: Update vercel.json (If Root Directory doesn't work)

If setting Root Directory doesn't work, update `frontend/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app"
}
```

Then in Vercel dashboard:
- Set Root Directory to `frontend`
- Vercel will automatically use the correct paths

## Step-by-Step Fix

### Method 1: Vercel Dashboard Configuration (Easiest)

1. **Go to Vercel Dashboard** → Your Frontend Project
2. **Click "Settings"** (gear icon)
3. **Go to "General"** tab
4. **Find "Root Directory"** section
5. **Click "Edit"**
6. **Enter**: `frontend`
7. **Click "Save"**
8. **Go to "Deployments"** tab
9. **Click the three dots** on the latest deployment
10. **Click "Redeploy"**

### Method 2: Delete and Recreate Project

If the above doesn't work:

1. **Delete the current frontend project** in Vercel
2. **Create a new project**
3. **Import the same GitHub repository**
4. **During setup, set:**
   - Root Directory: `frontend`
   - Framework Preset: Create React App
   - Build Command: (leave empty - auto-detected)
   - Output Directory: (leave empty - auto-detected)
5. **Add environment variable:**
   - `REACT_APP_API_URL=https://your-backend-url.vercel.app`
6. **Deploy**

## Verify Configuration

After deploying, check:

1. **Build logs should show:**
   ```
   Installing dependencies...
   Running "npm run build"
   ```

2. **No errors about `react-scripts` not found**

3. **Build completes successfully**

## Common Issues

### Issue: Still getting "react-scripts: command not found"

**Solution:**
- Make sure Root Directory is set to `frontend` (not `./frontend` or `/frontend`)
- Clear Vercel build cache
- Redeploy

### Issue: Build succeeds but site doesn't load

**Solution:**
- Check Output Directory is set to `build` (or leave empty for auto-detection)
- Verify `frontend/vercel.json` has the rewrite rule for SPA routing

### Issue: Environment variables not working

**Solution:**
- Environment variables must start with `REACT_APP_` for Create React App
- Redeploy after adding environment variables
- Check variable names are correct (case-sensitive)

## Correct Vercel Project Settings

### Frontend Project Settings:
- **Root Directory**: `frontend`
- **Framework Preset**: Create React App
- **Build Command**: (auto-detected, should be `npm run build`)
- **Output Directory**: (auto-detected, should be `build`)
- **Install Command**: (auto-detected, should be `npm install`)

### Environment Variables:
- `REACT_APP_API_URL=https://your-backend-url.vercel.app`

## Alternative: Simplified vercel.json

If you set Root Directory correctly, you can use a simpler `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Vercel will auto-detect Create React App and handle the rest.

## Testing

After fixing:

1. **Check build logs** - should show successful build
2. **Visit your site** - should load correctly
3. **Test API calls** - should connect to backend
4. **Test routing** - refresh should work (no 404)

---

**The most important step is setting the Root Directory to `frontend` in Vercel dashboard settings!**





