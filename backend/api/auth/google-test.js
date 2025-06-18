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

  console.log('Google OAuth test endpoint accessed');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'GET') {
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
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
} 