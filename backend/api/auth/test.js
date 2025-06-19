export default function handler(req, res) {
  res.status(200).json({ 
    message: '✅ Auth API is working!',
    routes: {
      google: '/api/auth/google',
      callback: '/api/auth/google/callback',
      me: '/api/auth/me',
      logout: '/api/auth/logout'
    },
    timestamp: new Date().toISOString()
  });
} 