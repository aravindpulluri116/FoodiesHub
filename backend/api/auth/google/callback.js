import dbConnect from '../../db';
import User from '../../models/User';

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
      const { code } = req.query;
      
      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
      }

      // Get the backend URL - use environment variable or construct from request
      let backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        // Fallback: construct from request headers
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        backendUrl = `${protocol}://${host}`;
      }

      // Remove /api from the backend URL for OAuth callbacks
      backendUrl = backendUrl.replace('/api', '');

      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        console.error('Token exchange failed:', tokenData);
        return res.redirect(`${process.env.FRONTEND_URL}?error=token_failed`);
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();
      
      if (!userData.id) {
        console.error('User info fetch failed:', userData);
        return res.redirect(`${process.env.FRONTEND_URL}?error=user_info_failed`);
      }

      // Find or create user
      let user = await User.findOne({ googleId: userData.id });
      
      if (!user) {
        user = await User.create({
          googleId: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
        });
      }

      // Create a simple session token (you might want to use JWT here)
      const sessionToken = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
      
      // Set cookie and redirect
      res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None`);
      res.redirect(`${process.env.FRONTEND_URL}?success=true`);
      
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in Google callback:', err);
    res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
  }
} 