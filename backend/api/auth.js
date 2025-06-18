import dbConnect from '../db.js';
import User from '../models/User.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Robust path parsing for Vercel
  const urlNoQuery = req.url.split('?')[0];
  const segments = urlNoQuery.split('/').filter(Boolean);
  const route = segments.length === 0 ? '/' : `/${segments.join('/')}`;
  console.log('DEBUG req.url:', req.url, 'segments:', segments, 'route:', route);

  // /api/auth
  if (route === '/' && req.method === 'GET') {
    res.status(404).json({ message: 'Not found', route, method: req.method });
    return;
  }

  // /api/auth/me
  if (route === '/me' && req.method === 'GET') {
    try {
      await dbConnect();
      const sessionCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('session='));
      if (!sessionCookie) return res.status(401).json({ message: 'Not authenticated' });
      const sessionToken = sessionCookie.split('=')[1];
      const decodedToken = Buffer.from(sessionToken, 'base64').toString();
      const [userId] = decodedToken.split(':');
      const user = await User.findById(userId).select('-__v');
      if (!user) return res.status(401).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (err) {
      console.error('Error in /auth/me:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
    return;
  }

  // /api/auth/logout
  if (route === '/logout' && req.method === 'GET') {
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0');
    res.redirect(process.env.FRONTEND_URL || '/');
    return;
  }

  // /api/auth/google
  if (route === '/google' && req.method === 'GET') {
    console.log('=== GOOGLE OAUTH ROUTE MATCHED ===');
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not set');
      return res.status(500).json({ 
        message: 'Google OAuth not configured',
        error: 'GOOGLE_CLIENT_ID environment variable is missing'
      });
    }
    const backendUrl = 'https://foodieshubbackend.vercel.app';
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${backendUrl}/api/auth/google/callback&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline`;
    console.log('Redirecting to Google OAuth:', googleAuthUrl);
    res.redirect(googleAuthUrl);
    return;
  }

  // /api/auth/google/callback
  if (route === '/google/callback' && req.method === 'GET') {
    try {
      await dbConnect();
      let codeParam;
      if (req.url.includes('?')) {
        const params = new URLSearchParams(req.url.split('?')[1]);
        codeParam = params.get('code');
      }
      if (!codeParam) return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
      const backendUrl = 'https://foodieshubbackend.vercel.app';
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: codeParam,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) return res.redirect(`${process.env.FRONTEND_URL}?error=token_failed`);
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userResponse.json();
      if (!userData.id) return res.redirect(`${process.env.FRONTEND_URL}?error=user_info_failed`);
      let user = await User.findOne({ googleId: userData.id });
      if (!user) {
        user = await User.create({
          googleId: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
        });
      }
      const sessionToken = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
      res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None`);
      res.redirect(`${process.env.FRONTEND_URL}?success=true`);
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=server_error`);
    }
    return;
  }

  // Not found
  res.status(404).json({ message: 'Not found', route, method: req.method });
} 