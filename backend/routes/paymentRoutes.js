const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, handleWebhook, isAuthenticated, retryPayment, createCodPayment } = require('../controllers/paymentController');

// Route to create a new order (requires authentication)
router.post('/create-order', isAuthenticated, createOrder);

// Route to retry payment for an existing order
router.post('/retry-payment', isAuthenticated, retryPayment);

// Route to create payment session for COD orders
router.post('/create-cod-payment', isAuthenticated, createCodPayment);

// Route to verify payment (requires authentication)
router.get('/verify/:orderId', isAuthenticated, verifyPayment);

// Route to get payment failure details (requires authentication)
router.get('/payment-details/:orderId', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: order.payment.status,
        paymentMethod: order.payment.method,
        failureReason: order.payment.paymentDetails?.get('failure_reason'),
        failureCode: order.payment.paymentDetails?.get('failure_code'),
        paymentDetails: order.payment.paymentDetails
      }
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ success: false, message: "Error retrieving payment details" });
  }
});

// Webhook route for payment notifications (no authentication needed as it's called by Cashfree)
router.post('/webhook', express.raw({ type: '*/*' }), handleWebhook);

module.exports = router; 