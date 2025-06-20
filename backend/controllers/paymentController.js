const { Cashfree } = require("cashfree-pg");
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Initialize Cashfree
const cashfree = new Cashfree(
    Cashfree.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
};

const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, phone } = req.body;

        // Validate request body
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty items array"
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }
        
        // Securely calculate total amount on the server
        const productIds = items.map(item => item.productId);
        const products = await Product.find({ '_id': { $in: productIds } });

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
            if (!item.quantity) {
                throw new Error("Invalid item structure: quantity is missing");
            }
            return {
                product: item.productId,
                quantity: item.quantity
            };
        });

        // Get user from request
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Optionally, update user's phone number if provided
        if (phone && user.phone !== phone) {
            user.phone = phone;
            await user.save();
        }

        if (totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total amount must be greater than zero."
            });
        }

        // Create order in your database
        const order = await Order.create({
            items: orderItems,
            address: deliveryAddress,
            totalAmount,
            status: 'pending',
            user: user._id,
            payment: {
                method: 'online',
                status: 'pending'
            }
        });

        // Create payment order with Cashfree for online payment
        const orderRequest = {
            order_id: order._id.toString(),
            order_amount: totalAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: user._id.toString(),
                customer_name: user.name,
                customer_email: user.email,
                customer_phone: user.phone || phone || "9999999999"
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment/result?order_id=${order._id}`
            }
        };

        const response = await cashfree.PGCreateOrder(orderRequest);
        console.log('Order Created successfully:', response);

        // Update order with payment details
        await order.updatePaymentStatus('pending', response.data.order_id, {
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id
        });

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: response.data
        });
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.response) {
            console.error('Cashfree API Error:', error.response.data);
        }
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "Error creating order"
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('Verifying payment for order:', orderId);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Fetch order status from Cashfree
        const response = await cashfree.PGFetchOrder(orderId);
        console.log('Payment verification response:', response);

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Order not found during verification:', orderId);
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // If payment is successful, update order and clear cart
        if (response.data.order_status === "PAID") {
            // Update payment status
            await order.updatePaymentStatus('completed', orderId, {
                payment_session_id: response.data.payment_session_id,
                order_id: orderId,
                payment_details: response.data
            });

            // Update order status
            await order.updateStatus('placed');

            // Clear the user's cart
            const user = await User.findById(order.user);
            if (user) {
                user.cart = [];
                await user.save();
                console.log('Cleared cart for user during verification:', user._id);
            } else {
                console.log('User not found during verification:', order.user);
            }
        } else if (response.data.order_status === "FAILED") {
            // Update payment status to failed
            await order.updatePaymentStatus('failed', orderId, {
                payment_session_id: response.data.payment_session_id,
                order_id: orderId,
                payment_details: response.data
            });
        }

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "Error verifying payment"
        });
    }
};

const handleWebhook = async (req, res) => {
    try {
        console.log('Webhook received with body:', req.body);
        const sig = req.headers["x-webhook-signature"];
        const ts = req.headers["x-webhook-timestamp"];

        if (!sig || !ts) {
            console.log('Missing webhook signature or timestamp');
            return res.status(400).json({ message: 'Missing webhook signature or timestamp' });
        }

        // Verify webhook signature
        try {
            Cashfree.PGVerifyWebhookSignature(sig, req.body, ts);
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        // Process the webhook data
        const { order_id, order_status } = req.body;
        console.log('Processing webhook for order:', { order_id, order_status });

        // Find the order
        const order = await Order.findById(order_id);
        if (!order) {
            console.log('Order not found for webhook:', order_id);
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order_status === "PAID") {
            // Update payment status
            await order.updatePaymentStatus('completed', order_id, {
                payment_session_id: req.body.payment_session_id,
                order_id: order_id,
                payment_details: req.body
            });

            // Update order status
            await order.updateStatus('placed');
            console.log('Updated order status to placed:', order_id);

            // Clear the user's cart
            const user = await User.findById(order.user);
            if (user) {
                user.cart = [];
                await user.save();
                console.log('Cleared cart for user:', user._id);
            } else {
                console.log('User not found for order:', order.user);
            }
        } else if (order_status === "FAILED") {
            // Update payment status to failed
            await order.updatePaymentStatus('failed', order_id, {
                payment_session_id: req.body.payment_session_id,
                order_id: order_id,
                payment_details: req.body
            });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ 
            message: 'Webhook processing failed',
            error: error.message 
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    handleWebhook,
    isAuthenticated
}; 