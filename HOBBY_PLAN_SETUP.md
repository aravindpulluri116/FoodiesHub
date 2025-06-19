# Google OAuth Setup for Vercel Hobby Plan

## 🎯 **Optimized for Hobby Plan (12 Function Limit)**

This setup is specifically designed to work within Vercel's Hobby plan limitations while maintaining all Google OAuth functionality.

## 📁 **Current Structure (Hobby Plan Optimized)**

```
pickles-test/
├── backend/
│   ├── api/
│   │   ├── auth.js              # ✅ All auth endpoints in one file
│   │   ├── products.js          # ✅ Products API
│   │   ├── cart.js              # ✅ Cart API
│   │   ├── orders.js            # ✅ Orders API
│   │   ├── payment.js           # ✅ Payment API
│   │   ├── admin.js             # ✅ Admin API
│   │   └── wishlist.js          # ✅ Wishlist API
│   ├── models/
│   │   └── User.js              # ✅ Updated User model
│   └── .env.example             # ✅ Environment variables
└── frontend/
    └── src/
        └── components/
            └── Header.tsx       # ✅ Login/logout UI
```

## 🔧 **Function Count Analysis**

| File | Functions | Total |
|------|-----------|-------|
| `auth.js` | 1 | 1 |
| `products.js` | 1 | 2 |
| `cart.js` | 1 | 3 |
| `orders.js` | 1 | 4 |
| `payment.js` | 1 | 5 |
| `admin.js` | 1 | 6 |
| `wishlist.js` | 1 | 7 |
| **Total** | **7** | **✅ Under 12 limit** |

## 🚀 **Deployment Steps**

### 1. **Environment Variables**
Set these in your Vercel dashboard:

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

### 2. **Google OAuth Configuration**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Set authorized redirect URI: `https://your-domain.vercel.app/api/auth/google/callback`

### 3. **Deploy**
```bash
vercel --prod
```

## 🔗 **API Endpoints**

Your `auth.js` file handles all these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Google OAuth initiation |
| `/api/auth/google/callback` | GET | OAuth callback |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | GET | Logout user |
| `/api/auth/google-test` | GET | Test endpoint |

## 🧪 **Testing**

1. **Test Endpoint**: `/api/auth/google-test`
2. **OAuth Flow**: Click "Login with Google"
3. **Session Check**: Verify user data after login
4. **Logout**: Test logout functionality

## 💡 **Advantages of This Approach**

✅ **Hobby Plan Compatible**: Stays under 12 function limit  
✅ **Single File**: All auth logic in one place  
✅ **Proven Working**: Your existing implementation  
✅ **Easy Maintenance**: No complex routing  
✅ **Cost Effective**: No need for Pro plan  

## 🔄 **Migration from Modular Structure**

If you had the modular structure and hit the limit:

1. ✅ **Removed**: `backend/api/auth/` folder
2. ✅ **Removed**: `vercel.json` file  
3. ✅ **Kept**: Updated `User.js` model
4. ✅ **Kept**: Documentation files

## 📊 **Performance Considerations**

- **Cold Starts**: Single function may have slightly longer cold starts
- **Memory Usage**: Slightly higher memory usage per function
- **Scaling**: Vercel handles scaling automatically
- **Cost**: No additional cost beyond Hobby plan

## 🚨 **When to Upgrade to Pro Plan**

Consider upgrading if you need:
- More than 12 serverless functions
- Advanced analytics
- Team collaboration
- Custom domains
- Priority support

## 📞 **Support**

For issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test individual endpoints
4. Check Google OAuth configuration

---

**Note**: This setup is optimized for cost-effectiveness while maintaining full functionality. Your Google OAuth will work exactly the same as the modular version! 