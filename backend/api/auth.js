// routes/auth.js

import dbConnect from '../db.js';
import User from '../models/User.js';

// 🔒 Use environment variables for URLs
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://foodieshub-two.vercel.app';
const BACKEND_URL  = process.env.BACKEND_URL || 'https://foodieshubbackend.vercel.app';

export default async function handler(req, res) {
  // 1) CORS headers - more permissive approach
  const allowedOrigins = [
    'https://foodieshub-two.vercel.app',
    'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app',
    'https://foodieshub.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  // Allow any Vercel domain for now (more permissive)
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback to the main frontend URL
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simplified path parsing
  const url = req.url || '';
  console.log('DEBUG - Full URL:', url);
  console.log('DEBUG - Request URL:', req.url);
  console.log('DEBUG - Request path:', req.url?.split('?')[0]);
  
  // Extract the path after /api/auth
  let path = '';
  if (url.includes('/api/auth/')) {
    path = url.split('/api/auth/')[1] || '';
    console.log('DEBUG - Found /api/auth/ in URL, extracted path:', path);
  } else if (url.includes('/api/auth')) {
    path = '';
    console.log('DEBUG - Found /api/auth in URL (no trailing slash)');
  } else {
    console.log('DEBUG - No /api/auth found in URL');
  }
  
  // Remove query parameters
  path = path.split('?')[0];
  
  console.log('DEBUG - Final extracted path:', path);
  console.log('DEBUG - Method:', req.method);
  console.log('DEBUG - Origin:', origin);
  console.log('DEBUG - Path === "me":', path === 'me');
  console.log('DEBUG - Method === "GET":', req.method === 'GET');

  // Route matching
  if (path === '' && req.method === 'GET') {
    // /api/auth
    return res.status(404).json({ message: 'Not found', path, method: req.method });
  }

  if (path === 'me' && req.method === 'GET') {
    // /api/auth/me
    console.log('DEBUG - /me route matched');
    try {
      await dbConnect();
      const sessionCookie = req.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('session='));
      if (!sessionCookie) {
        console.log('DEBUG - No session cookie found');
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const sessionToken = sessionCookie.split('=')[1];
      const decoded = Buffer.from(sessionToken, 'base64').toString();
      const [userId] = decoded.split(':');
      console.log('DEBUG - User ID from session:', userId);
      
      const user = await User.findById(userId).select('-__v');
      if (!user) {
        console.log('DEBUG - User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('DEBUG - User found:', user.email);
      return res.status(200).json(user);
    } catch (err) {
      console.error('Error in /auth/me:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (path === 'logout' && req.method === 'GET') {
    // /api/auth/logout
    console.log('DEBUG - /logout route matched');
    res.setHeader(
      'Set-Cookie',
      'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0'
    );
    return res.redirect(FRONTEND_URL);
  }

  if (path === 'google-test' && req.method === 'GET') {
    // /api/auth/google-test
    console.log('DEBUG - /google-test route matched');
    return res.send('✅ /api/auth/google-test route is working!');
  }

  if (path === 'google' && req.method === 'GET') {
    // /api/auth/google
    console.log('DEBUG - /google route matched');
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

  if (path === 'google/callback' && req.method === 'GET') {
    // /api/auth/google/callback
    console.log('DEBUG - /google/callback route matched');
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

  // Catch-all Not Found
  console.log('DEBUG - No route matched, returning 404');
  return res.status(404).json({
    message: 'Not found',
    path,
    method: req.method,
    url: req.url
  });
}
  