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
        console.log('[DEBUG] Order created in DB:', order._id);

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

        // Find the order first
        const order = await Order.findById(orderId);
        if (!order) {
            console.error('[DEBUG] Order not found in DB during verification:', orderId);
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if this is a COD order that was converted to online payment
        if (order.payment.method === 'cash_on_delivery' || 
            (order.payment.paymentDetails && order.payment.paymentDetails.get('original_method') === 'cash_on_delivery')) {
            
            // For COD orders converted to online, check if Cashfree payment details exist
            const { cf_order_id, cf_payment_id } = req.body;
            
            if (!cf_order_id || !cf_payment_id) {
                return res.status(400).json({
                    success: false,
                    message: "Missing Cashfree payment details for COD to online conversion"
                });
            }

            // Verify with Cashfree using the provided order ID
            const response = await cashfree.PGFetchOrder(cf_order_id);
            console.log('COD payment verification response:', response);

            if (response.data.order_status === "PAID") {
                // Update payment status
                await order.updatePaymentStatus('completed', cf_order_id, {
                    payment_session_id: response.data.payment_session_id,
                    order_id: cf_order_id,
                    payment_details: response.data,
                    cf_payment_id: cf_payment_id,
                    original_method: 'cash_on_delivery'
                });

                // Keep order status as pending for admin approval
                // Order status will be updated by admin manually

                // Clear the user's cart
                const user = await User.findById(order.user);
                if (user) {
                    user.cart = [];
                    await user.save();
                    console.log('Cleared cart for user during COD verification:', user._id);
                }

                return res.status(200).json({
                    success: true,
                    message: "COD payment completed successfully",
                    data: response.data
                });
            } else if (response.data.order_status === "FAILED") {
                // Update payment status to failed
                await order.updatePaymentStatus('failed', cf_order_id, {
                    payment_session_id: response.data.payment_session_id,
                    order_id: cf_order_id,
                    payment_details: response.data,
                    cf_payment_id: cf_payment_id,
                    failure_reason: response.data.payment_details?.failure_reason || 'Payment failed',
                    failure_code: response.data.payment_details?.failure_code || 'UNKNOWN',
                    original_method: 'cash_on_delivery'
                });
                
                console.log('COD payment failed for order:', orderId, {
                    failure_reason: response.data.payment_details?.failure_reason,
                    failure_code: response.data.payment_details?.failure_code,
                    payment_details: response.data
                });

                return res.status(200).json({
                    success: false,
                    message: "COD payment failed",
                    data: response.data
                });
            }
        }

        // For original online orders, continue with normal Cashfree verification
        const response = await cashfree.PGFetchOrder(orderId);
        console.log('Payment verification response:', response);

        // If payment is successful, update order and clear cart
        if (response.data.order_status === "PAID") {
            // Update payment status
            await order.updatePaymentStatus('completed', orderId, {
                payment_session_id: response.data.payment_session_id,
                order_id: orderId,
                payment_details: response.data
            });

            // Keep order status as pending for admin approval
            // Order status will be updated by admin manually

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
                payment_details: response.data,
                failure_reason: response.data.payment_details?.failure_reason || 'Payment failed',
                failure_code: response.data.payment_details?.failure_code || 'UNKNOWN'
            });
            
            console.log('Payment failed for order:', orderId, {
                failure_reason: response.data.payment_details?.failure_reason,
                failure_code: response.data.payment_details?.failure_code,
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

            // Keep order status as pending for admin approval
            // Order status will be updated by admin manually
            console.log('Payment completed, order status remains pending for admin approval:', order_id);

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
                payment_details: req.body,
                failure_reason: req.body.payment_details?.failure_reason || 'Payment failed',
                failure_code: req.body.payment_details?.failure_code || 'UNKNOWN'
            });
            
            console.log('Payment failed via webhook for order:', order_id, {
                failure_reason: req.body.payment_details?.failure_reason,
                failure_code: req.body.payment_details?.failure_code,
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

const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status === 'completed' || order.status === 'cancelled') {
            return res.status(400).json({ success: false, message: `Cannot pay for a ${order.status} order.` });
        }

        // Allow retry for failed payments
        if (order.payment.status === 'failed') {
            console.log('Retrying payment for failed order:', orderId);
        }

        const user = order.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "User for this order not found" });
        }

        const orderRequest = {
            order_id: `${order._id.toString()}_${Date.now()}`,
            order_amount: order.totalAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: user._id.toString(),
                customer_name: user.name,
                customer_email: user.email,
                customer_phone: user.phone || "9999999999"
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment/result?order_id=${order._id}`
            }
        };

        const response = await cashfree.PGCreateOrder(orderRequest);
        
        await order.updatePaymentStatus('pending', order._id.toString(), {
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id
        });

        res.status(200).json({
            success: true,
            message: "Payment session created successfully",
            data: response.data
        });

    } catch (error) {
        console.error('Retry payment error:', error);
        if (error.response) {
            console.error('Cashfree API Error:', error.response.data);
        }
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "Error retrying payment"
        });
    }
};

const createCodPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        // Find the existing COD order
        const order = await Order.findById(orderId).populate('user').populate('items.product');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if it's a COD order
        if (order.payment.method !== 'cash_on_delivery') {
            return res.status(400).json({ success: false, message: "This order is not a Cash on Delivery order" });
        }

        // Check if payment is still pending or failed (allow retry for failed payments)
        if (order.payment.status !== 'pending' && order.payment.status !== 'failed') {
            return res.status(400).json({ success: false, message: "Payment has already been processed for this order" });
        }

        // Log if retrying a failed payment
        if (order.payment.status === 'failed') {
            console.log('Retrying payment for failed COD order:', orderId);
        }

        const user = order.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "User for this order not found" });
        }

        // Create a new payment session for the COD order
        const orderRequest = {
            order_id: `${order._id.toString()}_cod_${Date.now()}`,
            order_amount: order.totalAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: user._id.toString(),
                customer_name: user.name,
                customer_email: user.email,
                customer_phone: user.phone || "9999999999"
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment/result?order_id=${order._id}&cf_order_id={order_id}&cf_payment_id={payment_id}`
            }
        };

        const response = await cashfree.PGCreateOrder(orderRequest);
        
        // Update the order to change payment method to online and set pending status
        order.payment.method = 'online';
        await order.updatePaymentStatus('pending', order._id.toString(), {
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id,
            original_method: 'cash_on_delivery'
        });

        res.status(200).json({
            success: true,
            message: "Payment session created successfully for COD order",
            data: response.data
        });

    } catch (error) {
        console.error('Create COD payment error:', error);
        if (error.response) {
            console.error('Cashfree API Error:', error.response.data);
        }
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || "Error creating payment session for COD order"
        });
    }
};

module.exports = {
    isAuthenticated,
    createOrder,
    verifyPayment,
    handleWebhook,
    retryPayment,
    createCodPayment
}; 