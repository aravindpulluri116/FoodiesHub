import dbConnect from '../db.js';
// import Payment from '../models/Payment.js'; // Uncomment and fix if you have a Payment model

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
    // ... existing code ...
  } catch (err) {
    console.error('Error in dbConnect or handler:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 