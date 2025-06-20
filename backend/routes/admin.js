const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Middleware to check if user is authenticated and is admin
const isAdmin = (req, res, next) => {
  console.log('Checking admin access:', { 
    isAuthenticated: req.isAuthenticated(), 
    user: req.user ? { 
      id: req.user._id, 
      isAdmin: req.user.isAdmin 
    } : null 
  });

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  next();
};

// Apply isAdmin middleware to all routes
router.use(isAdmin);

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Place an order
router.post('/orders/:orderId/place', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Attempting to place order:', orderId);

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('Invalid order ID format:', orderId);
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId).populate('user', 'name email').populate('items.product', 'name price');
    
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Current order status:', order.status);
    console.log('Order details:', {
      id: order._id,
      user: order.user,
      status: order.status,
      items: order.items.length
    });

    if (!order.canBePlaced()) {
      console.log('Order cannot be placed in current status:', order.status);
      return res.status(400).json({ 
        message: 'Order cannot be placed in current status',
        currentStatus: order.status
      });
    }

    const updatedOrder = await order.updateStatus('placed');
    console.log('Order placed successfully:', updatedOrder._id);
    
    res.json({ message: 'Order placed successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      message: 'Error placing order', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Cancel an order (admin only)
router.post('/orders/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Attempting to cancel order:', orderId);

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('Invalid order ID format:', orderId);
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId).populate('user', 'name email').populate('items.product', 'name price');
    
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Current order status:', order.status);
    console.log('Order details:', {
      id: order._id,
      user: order.user,
      status: order.status,
      items: order.items.length
    });

    if (!order.canBeCancelled()) {
      console.log('Order cannot be cancelled in current status:', order.status);
      return res.status(400).json({ 
        message: 'Order cannot be cancelled in current status',
        currentStatus: order.status
      });
    }
    
    const updatedOrder = await order.updateStatus('cancelled');
    console.log('Order cancelled successfully:', updatedOrder._id);
    
    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      message: 'Error cancelling order', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 