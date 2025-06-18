import dbConnect from '../db';
import User from '../models/User';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await dbConnect();
    
    if (req.method === 'GET') {
      // Handle Google OAuth login
      const { pathname } = new URL(req.url, `http://${req.headers.host}`);
      
      if (pathname.includes('/auth/google')) {
        // Redirect to Google OAuth
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${process.env.BACKEND_URL}/api/auth/google/callback&` +
          `response_type=code&` +
          `scope=openid email profile&` +
          `access_type=offline`;
        
        res.redirect(googleAuthUrl);
        return;
      }
      
      // Handle other GET requests (like /auth/me)
      res.status(404).json({ message: 'Not Found' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in auth handler:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 