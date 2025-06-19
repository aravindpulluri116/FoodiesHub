# Migration Guide: Old Auth.js to New Modular Structure

## Overview

Your current `auth.js` file contains all authentication logic in one place. The new structure separates this into individual files for better maintainability and follows Vercel's serverless function best practices.

## Current vs New Structure

### Current Structure (auth.js)
```
backend/api/auth.js
├── /me endpoint
├── /logout endpoint  
├── /google endpoint
├── /google/callback endpoint
└── /google-test endpoint
```

### New Structure
```
backend/api/auth/
├── google.js           # /api/auth/google
├── google/callback.js  # /api/auth/google/callback
├── me.js              # /api/auth/me
├── logout.js          # /api/auth/logout
└── test.js            # /api/auth/test
```

## Migration Steps

### Step 1: Backup Current Implementation
```bash
# Backup your current auth.js
cp backend/api/auth.js backend/api/auth.js.backup
```

### Step 2: Test New Structure
The new files have been created. Test them:

1. **Test Endpoint**: Visit `/api/auth/test`
2. **Google OAuth**: Click "Login with Google" 
3. **Session Check**: Verify `/api/auth/me` works
4. **Logout**: Test `/api/auth/logout`

### Step 3: Update Frontend (if needed)
Your frontend should work without changes since the endpoints remain the same:

```tsx
// These URLs will work with both old and new structure
const loginUrl = `${config.apiUrl}/auth/google`;
const meUrl = `${config.apiUrl}/auth/me`;
const logoutUrl = `${config.apiUrl}/auth/logout`;
```

### Step 4: Remove Old File (Optional)
Once you've verified the new structure works:

```bash
# Only remove after testing
rm backend/api/auth.js
```

## Key Differences

### 1. Environment Variables
**Old**: Hard-coded URLs in auth.js
```javascript
const FRONTEND_URL = 'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app';
const BACKEND_URL  = 'https://foodieshubbackend.vercel.app';
```

**New**: Environment variables
```javascript
const frontendBase = process.env.FRONTEND_URL || 'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app';
const backendBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://foodieshubbackend.vercel.app';
```

### 2. Error Handling
**New**: Better error handling with try-catch blocks and proper error responses

### 3. CORS Headers
**Old**: CORS headers in every request
**New**: Vercel handles CORS automatically for serverless functions

### 4. File Organization
**Old**: Single file with route parsing
**New**: Separate files for each endpoint

## Testing Checklist

- [ ] `/api/auth/test` returns success message
- [ ] `/api/auth/google` redirects to Google OAuth
- [ ] `/api/auth/google/callback` processes OAuth and creates session
- [ ] `/api/auth/me` returns user data when authenticated
- [ ] `/api/auth/logout` clears session and redirects
- [ ] Frontend login button works
- [ ] User session persists across page reloads
- [ ] Logout button works

## Rollback Plan

If issues arise, you can quickly rollback:

```bash
# Restore old auth.js
mv backend/api/auth.js.backup backend/api/auth.js

# Remove new files
rm -rf backend/api/auth/
```

## Benefits of New Structure

1. **Better Performance**: Each function is optimized independently
2. **Easier Debugging**: Issues are isolated to specific endpoints
3. **Better Scalability**: Vercel can scale individual functions
4. **Cleaner Code**: Each file has a single responsibility
5. **Easier Testing**: Test individual endpoints separately

## Environment Variables

Make sure these are set in your Vercel dashboard:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
MONGODB_URI=your_mongodb_connection_string
```

## Support

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test individual endpoints
4. Compare with the backup file
5. Check the test endpoint for debugging info

---

**Note**: The new structure maintains full backward compatibility with your existing frontend code. 