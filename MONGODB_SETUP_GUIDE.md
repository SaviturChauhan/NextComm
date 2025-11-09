# MongoDB Setup Guide for Vercel Deployment

This guide will help you set up MongoDB Atlas and connect it to your Vercel-deployed backend.

## Step 1: Create MongoDB Atlas Account (If You Don't Have One)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (or log in if you already have one)
3. Create a new project (or use an existing one)

## Step 2: Create a MongoDB Cluster

1. In MongoDB Atlas dashboard, click **"Build a Database"**
2. Choose **"M0 FREE"** cluster (free tier)
3. Select a **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Select a **Region** closest to your Vercel deployment
5. Click **"Create"**
6. Wait 3-5 minutes for cluster to be created

## Step 3: Configure Database User

1. In the cluster setup, you'll see **"Create Database User"**
2. Choose **"Password"** authentication
3. Enter a **Username** (e.g., `nextcomm_user`)
4. Enter a **Password** (use a strong password, save it securely!)
5. Click **"Create User"**
6. **IMPORTANT:** Save the username and password - you'll need them for the connection string!

## Step 4: Configure Network Access

This is **CRITICAL** for Vercel to connect to your database!

1. In MongoDB Atlas, click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** button
   - This adds `0.0.0.0/0` which allows all IPs
   - **OR** click **"Add Current IP Address"** and then manually add `0.0.0.0/0`
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to take effect

**Why `0.0.0.0/0`?**
- Vercel uses dynamic IPs that change frequently
- Allowing all IPs is safe because MongoDB requires authentication
- Your database is protected by username/password

## Step 5: Get Your Connection String

1. In MongoDB Atlas, click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as the driver
5. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. **Replace the placeholders:**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - **URL-encode** the password if it contains special characters:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
     - `?` → `%3F`
   - Add your database name after the cluster URL:
     - Change: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`
     - To: `mongodb+srv://user:pass@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority`
     - (Replace `nextcomm` with your preferred database name)

**Example Connection String:**
```
mongodb+srv://nextcomm_user:MySecurePassword123@cluster0.abc123.mongodb.net/nextcomm?retryWrites=true&w=majority
```

## Step 6: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key:** `MONGODB_URI`
   - **Value:** Your connection string from Step 5
   - **Environment:** Select **Production**, **Preview**, and **Development** (or just Production)
6. Click **"Save"**
7. **IMPORTANT:** Go to **Deployments** tab and **Redeploy** your backend!

## Step 7: Verify Connection String Format

Your connection string should look like this:

```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

**Components:**
- `mongodb+srv://` - Protocol (SRV record)
- `username:password@` - Your database credentials
- `cluster-name.xxxxx.mongodb.net` - Your cluster hostname
- `/database-name` - Your database name (e.g., `nextcomm`)
- `?retryWrites=true&w=majority` - Connection options

## Step 8: Test the Connection

### Option 1: Test in Vercel Logs

1. After redeploying, go to **Vercel Dashboard** → **Backend Project** → **Deployments**
2. Click on the latest deployment
3. Click **"Functions"** tab
4. Try to trigger a function (e.g., login)
5. Check the logs - you should see:
   - `✅ MongoDB connected successfully`
   - `Database: nextcomm` (or your database name)

### Option 2: Test Health Endpoint

1. Open your browser or use curl:
   ```
   GET https://your-backend.vercel.app/api/health
   ```
2. Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

### Option 3: Test Login

1. Go to your frontend
2. Try to login
3. Should work without "Database connection failed" error

## Common Issues and Fixes

### Issue 1: "MONGODB_URI not set"

**Solution:**
- Verify `MONGODB_URI` is set in Vercel environment variables
- Make sure you selected the correct **Environment** (Production, Preview, Development)
- **Redeploy** your backend after adding the variable

### Issue 2: "Authentication failed"

**Solution:**
- Check your username and password are correct
- Make sure password is URL-encoded if it contains special characters
- Verify the database user exists in MongoDB Atlas
- Try creating a new database user

### Issue 3: "Connection timeout" or "ENOTFOUND"

**Solution:**
- **Most Common:** Check MongoDB Atlas **Network Access**
  - Go to MongoDB Atlas → Network Access
  - Make sure `0.0.0.0/0` is allowed (allows all IPs)
  - Wait 1-2 minutes after adding IP
- Verify your cluster is running (not paused)
- Check your cluster hostname is correct in connection string

### Issue 4: "Database not found"

**Solution:**
- MongoDB Atlas creates databases automatically when you first write to them
- Make sure your connection string includes the database name:
  - `mongodb+srv://user:pass@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority`
  - (Note the `/nextcomm` before the `?`)

### Issue 5: Special Characters in Password

If your password contains special characters, you need to URL-encode them:

**Special Characters:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

**Example:**
- Password: `MyP@ssw0rd#123`
- Encoded: `MyP%40ssw0rd%23123`
- Connection string: `mongodb+srv://user:MyP%40ssw0rd%23123@cluster.mongodb.net/nextcomm?retryWrites=true&w=majority`

**Easy Way:** Use an online URL encoder or create a password without special characters.

### Issue 6: Still Getting "Database connection failed"

**Checklist:**
1. ✅ `MONGODB_URI` is set in Vercel
2. ✅ Connection string format is correct
3. ✅ Username and password are correct (URL-encoded if needed)
4. ✅ Database name is included in connection string
5. ✅ MongoDB Atlas Network Access allows `0.0.0.0/0`
6. ✅ Backend has been **Redeployed** after setting `MONGODB_URI`
7. ✅ MongoDB cluster is running (not paused)
8. ✅ Check Vercel function logs for specific error messages

## Security Best Practices

1. **Use Strong Passwords:** Use a long, random password for your database user
2. **Don't Commit Secrets:** Never commit `MONGODB_URI` to Git
3. **Use Environment Variables:** Always use environment variables for sensitive data
4. **Limit Network Access:** In production, consider restricting IPs (but Vercel needs `0.0.0.0/0`)
5. **Regular Backups:** Enable MongoDB Atlas backups for production data

## Quick Reference

### Connection String Template:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER-HOST/DATABASE-NAME?retryWrites=true&w=majority
```

### Vercel Environment Variables:
- **Key:** `MONGODB_URI`
- **Value:** Your connection string
- **Environment:** Production (and Preview/Development if needed)

### MongoDB Atlas Settings:
- **Network Access:** `0.0.0.0/0` (allows all IPs)
- **Database User:** Created with username/password
- **Cluster:** M0 FREE (or paid tier)

## Still Having Issues?

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Backend → Deployments → Latest → Functions
   - Look for error messages
   - Share the specific error for help

2. **Test Connection Locally:**
   - Create a test file to connect to MongoDB
   - This helps isolate if it's a Vercel-specific issue

3. **Verify MongoDB Atlas:**
   - Check cluster is running
   - Verify network access settings
   - Check database user exists

4. **Common Mistakes:**
   - Forgetting to redeploy after adding environment variable
   - Not URL-encoding special characters in password
   - Missing database name in connection string
   - Network access not allowing all IPs

---

**Need More Help?** Check the Vercel function logs for specific error messages and refer to the troubleshooting section above.

