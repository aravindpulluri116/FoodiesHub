import dbConnect from '../db';
import Product from '../models/Product';

export default async function handler(req, res) {
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