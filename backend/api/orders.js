import dbConnect from '../db';
import Order from '../models/Order';

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
      try {
        const orders = await Order.find();
        res.status(200).json(orders);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in dbConnect or handler:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 