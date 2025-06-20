const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('Checking authentication:', req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Create a new order
router.post('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Creating order for user:', req.user._id);
    console.log('Incoming order data (req.body):', JSON.stringify(req.body, null, 2));
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.body.items || req.body.items.length === 0) {
      console.log('No items provided');
      return res.status(400).json({ message: 'No items provided' });
    }

    if (!req.body.address) {
      console.log('Address is required');
      return res.status(400).json({ message: 'Address is required' });
    }

    console.log('Order items:', req.body.items);
    const totalAmount = req.body.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);

    console.log('Creating order with total amount:', totalAmount);
    const order = new Order({
      user: req.user._id,
      items: req.body.items.map(item => ({
        product: item.productId._id,
        quantity: item.quantity
      })),
      totalAmount,
      address: req.body.address
    });

    console.log('Attempting to save order:', order);
    await order.save();
    console.log('Order saved successfully:', order);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel an order
router.post('/:orderId/cancel', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 