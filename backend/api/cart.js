import dbConnect from '../db.js';
// import Cart from '../models/Cart.js'; // Uncomment and fix if you have a Cart model

export default async function handler(req, res) {
  // 1) CORS headers - flexible approach
  const allowedOrigins = [
    'https://foodieshub-two.vercel.app',
    'https://foodieshub-gf03ozif6-aravind-pulluris-projects.vercel.app',
    'https://foodieshub-git-main-aravind-pulluris-projects.vercel.app',
    'https://foodieshub.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  
  // Allow any Vercel domain for now (more permissive)
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback to the main frontend URL
    res.setHeader('Access-Control-Allow-Origin', 'https://foodieshub-two.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({ message: 'Cart endpoint placeholder' });
} 