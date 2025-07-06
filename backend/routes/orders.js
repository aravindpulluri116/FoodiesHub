const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

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
    console.log('Creating COD order for user:', req.user._id);
    console.log('Incoming order data (req.body):', JSON.stringify(req.body, null, 2));

    const { items, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Extract product IDs from the items
    const productIds = items.map(item => item.productId);

    // Fetch all products from the DB to get their prices
    const products = await Product.find({ '_id': { $in: productIds } });

    // Create a price map for quick lookup
    const priceMap = products.reduce((map, product) => {
      map[product._id.toString()] = product.price;
      return map;
    }, {});

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const price = priceMap[item.productId];
      if (price === undefined) {
        console.error(`Product with ID ${item.productId} not found in the database or has no price.`);
        throw new Error(`Product with ID ${item.productId} not found or price is missing.`);
      }
      totalAmount += price * item.quantity;
      return {
        product: item.productId,
        quantity: item.quantity
      };
    });
    
    console.log('Calculated Total Amount:', totalAmount);

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      address,
      status: 'placed', // Set status to 'placed' for COD orders
      payment: {
        method: 'cash_on_delivery',
        status: 'pending'
      }
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