# Admin Role Implementation Guide

This document explains the admin role system that has been added to NextComm.

## Overview

The admin role system allows designated users to manage the platform, including:
- User management (view, change roles, delete users)
- Content moderation (delete/edit questions and answers)
- Site statistics and analytics
- Accept/unaccept answers (admin override)

## Features Implemented

### 1. User Management
- **View All Users**: See a paginated list of all registered users
- **Change User Roles**: Promote any USER to ADMIN or demote ADMIN to USER
- **Delete Users**: Permanently delete a user and all their associated content
- **View User Stats**: See user's points, questions count, and answers count

### 2. Content Moderation
- **Delete Any Question**: Admins can delete any question posted by any user
- **Delete Any Answer**: Admins can delete any answer posted by any user
- **Accept/Unaccept Answers**: Admins can override the accepted answer status on any question

### 3. Dashboard & Analytics
- **Statistics Overview**: View site-wide stats including:
  - Total users
  - Total questions
  - Total answers
  - New users this week
  - New questions this week
  - New answers this week

## Setup Instructions

### Step 1: Create Your First Admin

Since no admin exists initially, you need to manually create one. There are two methods:

#### Method 1: Using the Script (Recommended)

1. Navigate to the backend directory:
```bash
cd WCOM_PROJECT/backend
```

2. Run the admin creation script:
```bash
npm run create-admin
```

3. Enter the email of the user you want to make an admin
4. Confirm the role change

#### Method 2: Manual Database Update

1. Sign up for a new account in your application
2. Connect to your MongoDB database (using MongoDB Compass or shell)
3. Find the user document you just created
4. Change the `role` field from `"USER"` to `"ADMIN"`
5. Log out and log back in to refresh your session

### Step 2: Access the Admin Dashboard

1. Log in with an admin account
2. You'll see an "Admin" link in the navigation bar (purple colored)
3. Click on it to access the admin dashboard at `/admin`

## API Endpoints

All admin endpoints are prefixed with `/api/admin` and require admin authentication.

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/:id` - Get single user details
- `PUT /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user and all their content

### Question Management
- `GET /api/admin/questions` - Get all questions (paginated)
- `DELETE /api/admin/questions/:id` - Delete any question
- `PUT /api/admin/questions/:id` - Update any question

### Answer Management
- `GET /api/admin/answers` - Get all answers (paginated)
- `DELETE /api/admin/answers/:id` - Delete any answer
- `POST /api/admin/answers/:id/accept` - Accept/unaccept answer (admin override)

## Security Features

1. **Role-Based Access Control**: All admin routes are protected by the `admin` middleware
2. **Self-Protection**: Admins cannot:
   - Change their own role
   - Delete their own account
3. **Authentication Required**: All admin endpoints require a valid JWT token
4. **Role Verification**: The middleware verifies the user has the ADMIN role on every request

## Frontend Components

### AdminRoute Component
Located at `frontend/src/components/auth/AdminRoute.js`
- Protects admin pages from unauthorized access
- Redirects non-admin users to the dashboard
- Shows loading state while checking authentication

### AdminDashboard Page
Located at `frontend/src/pages/AdminDashboard.js`
- Main admin interface with tabbed navigation
- Statistics overview
- User management table
- Questions management table
- Answers management table

## Database Schema Changes

### User Model
Added `role` field to the User schema:
```javascript
role: {
  type: String,
  enum: ['USER', 'ADMIN'],
  default: 'USER'
}
```

All existing users will have the role `'USER'` by default.

## Backend Files Added/Modified

### New Files
- `backend/middleware/admin.js` - Admin authentication middleware
- `backend/routes/admin.js` - Admin API routes
- `backend/scripts/createAdmin.js` - Script to create admin users
- `frontend/src/components/auth/AdminRoute.js` - Admin route protection
- `frontend/src/pages/AdminDashboard.js` - Admin dashboard page

### Modified Files
- `backend/models/User.js` - Added role field
- `backend/routes/auth.js` - Include role in login/register responses
- `backend/server.js` - Added admin routes
- `backend/package.json` - Added create-admin script
- `frontend/src/App.js` - Added admin route
- `frontend/src/components/layout/Navbar.js` - Added admin link for admin users

## Usage Examples

### Making a User an Admin
```bash
cd WCOM_PROJECT/backend
npm run create-admin
# Enter user email when prompted
```

### Changing User Role via API
```javascript
// PUT /api/admin/users/:id/role
{
  "role": "ADMIN" // or "USER"
}
```

### Accepting an Answer via API
```javascript
// POST /api/admin/answers/:id/accept
{
  "isAccepted": true // or false
}
```

## Testing the Admin Features

1. Create an admin user using the script
2. Log in with the admin account
3. Navigate to `/admin`
4. Test the following:
   - View statistics
   - View all users
   - Change a user's role
   - Delete a question
   - Delete an answer
   - Accept/unaccept an answer

## Troubleshooting

### "Access denied" error
- Ensure you're logged in with an admin account
- Check that the user's role in the database is `"ADMIN"`
- Try logging out and logging back in

### Admin link not showing
- Verify the user object includes the `role` field
- Check that `user.role === 'ADMIN'` in the AuthContext
- Ensure the auth API returns the role field

### Script not working
- Make sure you're in the backend directory
- Check that your `.env` file has the correct `MONGODB_URI`
- Verify the user email exists in the database

## Future Enhancements

Potential features to add:
- Category management (create, edit, delete categories)
- Difficulty level management
- Tag management (merge duplicates, delete unused)
- User reporting system
- Content moderation queue
- Activity logs

## Notes

- Admins have full control over the platform - use with caution
- Deleted users and their content cannot be recovered
- Role changes take effect immediately after login
- The admin dashboard uses pagination for large datasets

