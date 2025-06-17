const axios = require('axios');

class PaymentService {
    static async createOrder(orderData) {
        try {
            console.log('Creating order with data:', orderData);
            
            const request = {
                order_id: orderData.orderId || `order_${Date.now()}`,
                order_amount: orderData.amount.toString(),
                order_currency: "INR",
                customer_details: {
                    customer_id: orderData.userId.toString(),
                    customer_name: orderData.customerName,
                    customer_email: orderData.customerEmail,
                    customer_phone: orderData.customerPhone,
                },
                order_meta: {
                    return_url: `${process.env.FRONTEND_URL}/payment/status?order_id={order_id}`,
                },
                order_note: orderData.note || "",
            };

            console.log('Sending request to Cashfree:', request);
            console.log('Cashfree environment:', process.env.CASHFREE_ENV);
            console.log('Cashfree app ID:', process.env.CASHFREE_APP_ID);
            
            const baseUrl = process.env.CASHFREE_ENV === 'production' 
                ? 'https://api.cashfree.com/pg'
                : 'https://sandbox.cashfree.com/pg';

            // Create a timestamp for the request
            const timestamp = Math.floor(Date.now() / 1000);
            
            // Create the signature
            const message = `${timestamp}.${JSON.stringify(request)}`;
            const signature = require('crypto')
                .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
                .update(message)
                .digest('hex');

            const response = await axios.post(
                `${baseUrl}/orders`,
                request,
                {
                    headers: {
                        'x-api-version': '2025-01-01',
                        'x-client-id': process.env.CASHFREE_APP_ID,
                        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                        'x-timestamp': timestamp,
                        'x-signature': signature,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Cashfree response:', response.data);
            
            if (!response.data) {
                throw new Error('Invalid response from Cashfree');
            }

            // Construct the hosted payment URL
            const hostedPaymentUrl = `${baseUrl}/orders/${response.data.order_id}/payments/session/${response.data.payment_session_id}/hosted`;
            
            return {
                order_id: response.data.order_id,
                payment_session_id: response.data.payment_session_id,
                payment_link: hostedPaymentUrl
            };
        } catch (error) {
            console.error("Error creating order:", {
                message: error.message,
                response: error.response?.data,
                stack: error.stack,
                environment: process.env.CASHFREE_ENV,
                appId: process.env.CASHFREE_APP_ID
            });
            
            // Return a more detailed error
            throw {
                message: error.response?.data?.message || error.message,
                code: error.response?.data?.code || 'PAYMENT_ERROR',
                details: error.response?.data || error
            };
        }
    }

    static async verifyOrder(orderId) {
        try {
            console.log('Verifying order:', orderId);
            
            const baseUrl = process.env.CASHFREE_ENV === 'production' 
                ? 'https://api.cashfree.com/pg'
                : 'https://sandbox.cashfree.com/pg';

            // Create a timestamp for the request
            const timestamp = Math.floor(Date.now() / 1000);
            
            // Create the signature
            const message = `${timestamp}.${orderId}`;
            const signature = require('crypto')
                .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
                .update(message)
                .digest('hex');

            const response = await axios.get(
                `${baseUrl}/orders/${orderId}`,
                {
                    headers: {
                        'x-api-version': '2025-01-01',
                        'x-client-id': process.env.CASHFREE_APP_ID,
                        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                        'x-timestamp': timestamp,
                        'x-signature': signature,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Verification response:', response.data);
            
            if (!response.data) {
                throw new Error('Invalid response from Cashfree');
            }
            
            return response.data;
        } catch (error) {
            console.error("Error verifying order:", {
                message: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            
            throw {
                message: error.response?.data?.message || error.message,
                code: error.response?.data?.code || 'VERIFICATION_ERROR',
                details: error.response?.data || error
            };
        }
    }
}

module.exports = PaymentService; 