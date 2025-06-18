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

  // Debug logging
  console.log('Google OAuth endpoint accessed');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('BACKEND_URL:', process.env.BACKEND_URL);

  try {
    if (req.method === 'GET') {
      // Check if required environment variables are set
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('GOOGLE_CLIENT_ID not set');
        return res.status(500).json({ message: 'Google OAuth not configured' });
      }

      // Get the backend URL - use environment variable or construct from request
      let backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        // Fallback: construct from request headers
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        backendUrl = `${protocol}://${host}`;
        console.log('Constructed backend URL:', backendUrl);
      }

      // Remove /api from the backend URL for OAuth callbacks
      backendUrl = backendUrl.replace('/api', '');

      // Redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${backendUrl}/api/auth/google/callback&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline`;
      
      console.log('Redirecting to:', googleAuthUrl);
      res.redirect(googleAuthUrl);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in Google auth:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 