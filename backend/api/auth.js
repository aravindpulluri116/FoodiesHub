// routes/auth.js

import dbConnect from '../db.js';
import User from '../models/User.js';

// 🔒 Use environment variables for URLs
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://foodieshub-two.vercel.app';
const BACKEND_URL  = process.env.BACKEND_URL || 'https://foodieshubbackend.vercel.app';

export default async function handler(req, res) {
  // 1) CORS headers - allow multiple origins
  const allowedOrigins = [
    'https://foodieshub-two.vercel.app',
    'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Robust path parsing
  let urlPath = req.url;
  const idx = urlPath.lastIndexOf('/api/auth');
  if (idx !== -1) {
    urlPath = urlPath.slice(idx + '/api/auth'.length) || '/';
  }
  const urlNoQuery = urlPath.split('?')[0];
  const segments = urlNoQuery.split('/').filter(Boolean);
  const route = segments.length === 0 ? '/' : `/${segments.join('/')}`;

  console.log('DEBUG req.url:', req.url, 'route:', route);

  // 2) /api/auth           → GET
  if (route === '/' && req.method === 'GET') {
    return res.status(404).json({ message: 'Not found', route, method: req.method });
  }

  // 3) /api/auth/me        → GET
  if (route === '/me' && req.method === 'GET') {
    try {
      await dbConnect();
      const sessionCookie = req.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('session='));
      if (!sessionCookie) 
        return res.status(401).json({ message: 'Not authenticated' });

      const sessionToken = sessionCookie.split('=')[1];
      const decoded = Buffer.from(sessionToken, 'base64').toString();
      const [userId] = decoded.split(':');
      const user = await User.findById(userId).select('-__v');
      if (!user) 
        return res.status(401).json({ message: 'User not found' });

      return res.status(200).json(user);
    } catch (err) {
      console.error('Error in /auth/me:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // 4) /api/auth/logout    → GET
  if (route === '/logout' && req.method === 'GET') {
    res.setHeader(
      'Set-Cookie',
      'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
    );
    return res.redirect(FRONTEND_URL);
  }

  // 5) TEST /api/auth/google → GET
  //    (quick test endpoint)
  if (route === '/google-test' && req.method === 'GET') {
    return res.send('✅ /api/auth/google-test route is working!');
  }

  // 6) /api/auth/google    → GET
  if (route === '/google' && req.method === 'GET') {
    console.log('=== GOOGLE OAUTH ROUTE MATCHED ===');
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth env vars missing');
      return res
        .status(500)
        .json({ message: 'Google OAuth not configured' });
    }

    const googleAuthUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(
        `${BACKEND_URL}/api/auth/google/callback`
      )}` +
      `&response_type=code` +
      `&scope=openid email profile` +
      `&access_type=offline`;

    console.log('Redirecting to Google OAuth:', googleAuthUrl);
    return res.redirect(googleAuthUrl);
  }

  // 7) /api/auth/google/callback → GET
  if (route === '/google/callback' && req.method === 'GET') {
    try {
      await dbConnect();

      // Extract authorization code
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const code = params.get('code');
      if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=no_code`);
      }

      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
          grant_type: 'authorization_code'
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return res.redirect(`${FRONTEND_URL}?error=token_failed`);
      }

      // Fetch user info
      const userRes = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );
      const userData = await userRes.json();
      if (!userData.id) {
        return res.redirect(`${FRONTEND_URL}?error=user_info_failed`);
      }

      // Create or find user
      let user = await User.findOne({ googleId: userData.id });
      if (!user) {
        user = await User.create({
          googleId: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture
        });
      }

      // Create session cookie
      const sessionToken = Buffer.from(
        `${user._id}:${Date.now()}`
      ).toString('base64');
      res.setHeader(
        'Set-Cookie',
        `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None`
      );

      // Redirect back to your frontend
      return res.redirect(`${FRONTEND_URL}?success=true`);
    } catch (err) {
      console.error('Error in Google callback:', err);
      return res.redirect(`${FRONTEND_URL}?error=server_error`);
    }
  }

  // 8) Catch-all Not Found
  return res.status(404).json({
    message: 'Not found',
    route,
    method: req.method
  });
}
  