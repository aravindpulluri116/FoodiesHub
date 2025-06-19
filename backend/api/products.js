import dbConnect from '../db.js';
import Product from '../models/Product.js';

export default async function handler(req, res) {
  // 1) CORS headers - flexible approach (updated for all Vercel domains)
  const allowedOrigins = [
    'https://foodieshub-two.vercel.app',
    'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app',
    'https://foodieshub-git-main-aravind-pulluris-projects.vercel.app',
    'https://foodieshub.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  console.log('DEBUG - Request origin:', origin);
  console.log('DEBUG - Allowed origins:', allowedOrigins);
  
  // Allow any Vercel domain for now (more permissive)
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    console.log('DEBUG - Setting CORS origin to:', origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log('DEBUG - Using fallback CORS origin');
    // Fallback to the main frontend URL
    res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('DEBUG - Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  try {
    await dbConnect();
    if (req.method === 'GET') {
      try {
        const products = await Product.find();
        res.status(200).json(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Error in dbConnect or handler:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
} 