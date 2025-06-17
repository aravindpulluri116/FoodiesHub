const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/auth');

// Debug middleware for payment routes
router.use((req, res, next) => {
  console.log('Payment route accessed:', {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user,
    headers: req.headers
  });
  next();
});

// Handle OPTIONS requests
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Test route
router.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Payment routes are working' });
});

// Create a new payment order
router.post('/create-order', isAuthenticated, async (req, res, next) => {
  console.log('Create order route accessed');
  try {
    await PaymentController.createOrder(req, res);
  } catch (error) {
    console.error('Error in create-order route:', error);
    next(error);
  }
});

// Verify payment order status
router.get('/verify/:orderId', isAuthenticated, async (req, res, next) => {
  console.log('Verify order route accessed');
  try {
    await PaymentController.verifyOrder(req, res);
  } catch (error) {
    console.error('Error in verify-order route:', error);
    next(error);
  }
});

module.exports = router; 