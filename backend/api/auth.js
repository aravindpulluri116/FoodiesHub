import dbConnect from './db.js';
import User from './models/User.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Helper: parse path
  const path = req.url.split('?')[0];

  // /api/auth/me
  if (path === '/me' && req.method === 'GET') {
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
  if (path === '/logout' && req.method === 'GET') {
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0');
    res.redirect(process.env.FRONTEND_URL || '/');
    return;
  }

  // /api/auth/google-test
  if (path === '/google-test' && req.method === 'GET') {
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
  if (path === '/google-simple' && req.method === 'GET') {
    res.status(200).json({
      message: 'Simple Google test endpoint is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
    return;
  }

  // /api/auth/google
  if (path === '/google' && req.method === 'GET') {
    // Google OAuth redirect
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      backendUrl = `${protocol}://${host}`;
    }
    backendUrl = backendUrl.replace('/api', '');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${backendUrl}/api/auth/google/callback&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline`;
    res.redirect(googleAuthUrl);
    return;
  }

  // /api/auth/google/callback
  if (path === '/google/callback' && req.method === 'GET') {
    try {
      await dbConnect();
      const { code } = req.query || {};
      // Parse code from query string if not present
      let codeParam = code;
      if (!codeParam && req.url.includes('?')) {
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
  res.status(404).json({ message: 'Not found', path, method: req.method });
} 