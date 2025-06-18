import dbConnect from '../db.js';
import User from '../models/User.js';

export default function handler(req, res) {
  res.status(200).json({
    message: 'Env test',
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      FRONTEND_URL: process.env.FRONTEND_URL,
      BACKEND_URL: process.env.BACKEND_URL,
    }
  });
}