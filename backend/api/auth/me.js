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
      // Get session from cookie
      const sessionCookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('session='));
      
      if (!sessionCookie) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const sessionToken = sessionCookie.split('=')[1];
      const decodedToken = Buffer.from(sessionToken, 'base64').toString();
      const [userId] = decodedToken.split(':');

      // Find user
      const user = await User.findById(userId).select('-__v');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      res.status(200).json(user);
      
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in /auth/me:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 