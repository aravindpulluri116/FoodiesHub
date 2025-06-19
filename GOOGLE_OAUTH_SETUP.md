# Google OAuth Setup for Pickles Hub

This document outlines the complete Google OAuth implementation for the Pickles Hub monorepo deployed on Vercel.

## 🏗️ Architecture Overview

```
Frontend (Vercel) ←→ Backend API (Vercel Functions) ←→ Google OAuth
```

## 📁 File Structure

```
pickles-test/
├── vercel.json                    # Vercel routing configuration
├── backend/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google.js         # Google OAuth initiation
│   │   │   ├── google/
│   │   │   │   └── callback.js   # OAuth callback handler
│   │   │   ├── me.js             # Session validation
│   │   │   ├── logout.js         # Logout handler
│   │   │   └── test.js           # Test endpoint
│   │   └── ...                   # Other API routes
│   ├── models/
│   │   └── User.js               # User model with googleId
│   └── .env.example              # Environment variables template
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Header.tsx        # Login/logout UI
    │   └── config/
    │       └── index.ts          # API configuration
    └── .env.example              # Frontend environment variables
```

## 🔧 Configuration Steps

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Set authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-vercel-domain.vercel.app/api/auth/google/callback`

### 2. Environment Variables

#### Backend (.env)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://your-backend-domain.vercel.app

# Database
MONGODB_URI=your_mongodb_connection_string
```

#### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3. Vercel Configuration

The `vercel.json` file handles routing:
- `/api/*` routes → `backend/api/*.js`
- All other routes → `frontend/*`

## 🚀 API Endpoints

### Authentication Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Initiates Google OAuth flow |
| `/api/auth/google/callback` | GET | Handles OAuth callback |
| `/api/auth/me` | GET | Get current user session |
| `/api/auth/logout` | GET | Logout user |
| `/api/auth/test` | GET | Test endpoint |

### Usage Examples

#### Frontend Login Button
```tsx
<a href={`${config.apiUrl}/auth/google`}>
  Login with Google
</a>
```

#### Check User Session
```tsx
const response = await axios.get(`${config.apiUrl}/auth/me`, {
  withCredentials: true
});
```

#### Logout
```tsx
await axios.get(`${config.apiUrl}/auth/logout`, {
  withCredentials: true
});
```

## 🔒 Security Features

1. **HttpOnly Cookies**: Session tokens stored in secure cookies
2. **SameSite=None**: Required for cross-domain OAuth
3. **Secure Flag**: HTTPS-only in production
4. **Base64 Encoding**: Session tokens encoded for security
5. **User Validation**: Server-side session validation

## 🧪 Testing

### Test the Setup

1. **Test Endpoint**: Visit `/api/auth/test`
2. **OAuth Flow**: Click "Login with Google" button
3. **Session Check**: Verify user data after login
4. **Logout**: Test logout functionality

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly
2. **Redirect URI Mismatch**: Check Google Console settings
3. **Environment Variables**: Verify all required vars are set
4. **Database Connection**: Ensure MongoDB is accessible

## 📝 User Model Schema

```javascript
{
  googleId: String,        // Google OAuth ID
  email: String,           // User email
  name: String,            // User name
  picture: String,         // Profile picture URL
  phone: String,           // Phone number (optional)
  isAdmin: Boolean,        // Admin privileges
  cart: Array,             // Shopping cart
  wishlist: Array,         // Wishlist items
  timestamps: true         // Created/updated timestamps
}
```

## 🚀 Deployment Checklist

- [ ] Google OAuth credentials configured
- [ ] Environment variables set in Vercel
- [ ] MongoDB connection string configured
- [ ] Frontend and backend URLs updated
- [ ] CORS settings verified
- [ ] Test OAuth flow end-to-end
- [ ] Verify session persistence
- [ ] Test logout functionality

## 🔄 Migration from Old Auth System

If migrating from the old `auth.js` file:

1. The new system uses separate files for each endpoint
2. Better error handling and logging
3. Improved security with proper cookie settings
4. Cleaner code organization

## 📞 Support

For issues or questions:
1. Check the test endpoint: `/api/auth/test`
2. Verify environment variables
3. Check Vercel function logs
4. Ensure Google OAuth is properly configured

---

**Note**: This setup is optimized for Vercel deployment with serverless functions. For local development, use the development URLs and ensure your local server is running on the correct ports. 