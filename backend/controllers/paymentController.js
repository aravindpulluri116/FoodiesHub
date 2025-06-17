const PaymentService = require('../services/paymentService');

class PaymentController {
    static async createOrder(req, res) {
        try {
            console.log('Payment createOrder request:', {
                body: req.body,
                user: req.user,
                session: req.session
            });

            if (!req.user) {
                console.error('No user found in request');
                return res.status(401).json({ message: 'User not authenticated' });
            }

            if (!req.body.phone) {
                console.error('Phone number is missing');
                return res.status(400).json({ message: 'Phone number is required' });
            }

            if (!req.body.orderId) {
                console.error('Order ID is missing');
                return res.status(400).json({ message: 'Order ID is required' });
            }

            const orderData = {
                orderId: req.body.orderId,
                amount: req.body.amount,
                userId: req.user._id,
                customerName: req.user.name,
                customerEmail: req.user.email,
                customerPhone: req.body.phone,
                note: req.body.note
            };

            console.log('Creating payment order with data:', orderData);

            const order = await PaymentService.createOrder(orderData);
            console.log('Payment order created successfully:', order);
            res.json(order);
        } catch (error) {
            console.error('Error in createOrder:', {
                message: error.message,
                code: error.code,
                details: error.details,
                stack: error.stack,
                requestBody: req.body,
                user: req.user
            });
            
            res.status(error.code === 'PAYMENT_ERROR' ? 400 : 500).json({ 
                message: error.message || 'Error creating order',
                code: error.code,
                details: error.details
            });
        }
    }

    static async verifyOrder(req, res) {
        try {
            const { orderId } = req.params;
            console.log('Verifying payment order:', orderId);
            const order = await PaymentService.verifyOrder(orderId);
            console.log('Payment order verified:', order);
            res.json(order);
        } catch (error) {
            console.error('Error in verifyOrder:', {
                message: error.message,
                code: error.code,
                details: error.details,
                stack: error.stack
            });
            
            res.status(error.code === 'VERIFICATION_ERROR' ? 400 : 500).json({ 
                message: error.message || 'Error verifying order',
                code: error.code,
                details: error.details
            });
        }
    }
}

module.exports = PaymentController; 