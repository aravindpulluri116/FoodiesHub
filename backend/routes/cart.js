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

// Get cart
router.get('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Getting cart for user:', req.user._id);
    const user = await User.findById(req.user._id).populate('cart.productId');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add to cart
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    console.log('Adding to cart request body:', req.body);
    console.log('User:', req.user);
    console.log('User ID:', req.user._id);
    
    const { productId, quantity } = req.body;
    
    // Validate request body
    if (!productId) {
      console.log('No productId provided');
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      console.log('Invalid quantity provided');
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', user);

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Found product:', product);

    // Check if product is already in cart
    const existingItem = user.cart.find(item => 
      item.productId && item.productId.toString() === productId
    );
    console.log('Existing item:', existingItem);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    console.log('Saved user cart');
    
    const updatedUser = await User.findById(req.user._id).populate('cart.productId');
    console.log('Updated cart:', updatedUser.cart);
    
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:productId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    
    const cartItem = user.cart.find(item => 
      item.productId.toString() === req.params.productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      user.cart = user.cart.filter(item => 
        item.productId.toString() !== req.params.productId
      );
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.productId');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove from cart
router.delete('/remove/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => 
      item.productId.toString() !== req.params.productId
    );
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.productId');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 