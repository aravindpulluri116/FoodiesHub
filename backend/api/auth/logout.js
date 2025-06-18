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
    if (req.method === 'GET') {
      // Clear session cookie
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0');
      res.status(200).json({ message: 'Logged out successfully' });
      
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in logout:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 