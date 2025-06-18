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

  // Robust path parsing
  // Vercel may set req.url to /google, /me, /google/callback, etc.
  // Or it may include query string: /google?foo=bar
  // Let's extract the first segment after the initial /
  const urlNoQuery = req.url.split('?')[0];
  const segments = urlNoQuery.split('/').filter(Boolean); // removes empty strings
  const route = segments[0] ? `/${segments[0]}` : '/';
  const subroute = segments[1] ? `/${segments[1]}` : '';

  console.log('AUTH DEBUG:', {
    reqUrl: req.url,
    urlNoQuery,
    segments,
    route,
    subroute,
    method: req.method
  });

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

  // /api/auth/google-test
  if (route === '/google-test' && req.method === 'GET') {
    res.status(200).json({
      message: 'Google OAuth test endpoint is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      env_vars: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        BACKEND_URL: process.env.BACKEND_URL || 'Not set',
        FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
      }
    });
    return;
  }

  // /api/auth/google-simple
  if (route === '/google-simple' && req.method === 'GET') {
    res.status(200).json({
      message: 'Simple Google test endpoint is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
    return;
  }

  // /api/auth/google
  if (route === '/google' && req.method === 'GET' && !subroute) {
    console.log('=== GOOGLE OAUTH ROUTE MATCHED ===');
    console.log('Google OAuth redirect requested');
    console.log('Environment variables:');
    console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('- BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET');
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
    
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not set');
      return res.status(500).json({ 
        message: 'Google OAuth not configured',
        error: 'GOOGLE_CLIENT_ID environment variable is missing'
      });
    }

    // Google OAuth redirect
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      backendUrl = `${protocol}://${host}`;
      console.log('Constructed backend URL:', backendUrl);
    }
    backendUrl = backendUrl.replace('/api', '');
    
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
  if (route === '/google' && subroute === '/callback' && req.method === 'GET') {
    try {
      await dbConnect();
      let codeParam;
      if (req.url.includes('?')) {
        const params = new URLSearchParams(req.url.split('?')[1]);
        codeParam = params.get('code');
      }
      if (!codeParam) return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
      let backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        backendUrl = `${protocol}://${host}`;
      }
      backendUrl = backendUrl.replace('/api', '');
      // Exchange code for access token
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
      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userResponse.json();
      if (!userData.id) return res.redirect(`${process.env.FRONTEND_URL}?error=user_info_failed`);
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
      // Create a simple session token
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
  console.log('Auth endpoint not found:', { route, subroute, method: req.method });
  res.status(404).json({ message: 'Not found', route, subroute, method: req.method });
} 