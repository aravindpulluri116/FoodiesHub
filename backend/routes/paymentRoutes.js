const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, handleWebhook, isAuthenticated } = require('../controllers/paymentController');

// Route to create a new order (requires authentication)
router.post('/create-order', isAuthenticated, createOrder);

// Route to verify payment (requires authentication)
router.get('/verify/:orderId', isAuthenticated, verifyPayment);

// Webhook route for payment notifications (no authentication needed as it's called by Cashfree)
router.post('/webhook', express.raw({ type: '*/*' }), handleWebhook);

module.exports = router; 