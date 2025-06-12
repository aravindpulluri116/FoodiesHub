const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Get wishlist
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.json(user.wishlist);
    }

    user.wishlist.push(productId);
    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 