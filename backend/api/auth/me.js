import dbConnect from '../../db.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const sessionCookie = req.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('session='));
      
    if (!sessionCookie) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const sessionToken = sessionCookie.split('=')[1];
    const decoded = Buffer.from(sessionToken, 'base64').toString();
    const [userId] = decoded.split(':');
    
    const user = await User.findById(userId).select('-__v');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Error in /auth/me:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 