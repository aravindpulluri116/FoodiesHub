require('dotenv').config();
const cashfree = require('./config/cashfree');

console.log('Environment:', process.env.NODE_ENV);
console.log('App ID:', process.env.CASHFREE_APP_ID);
console.log('Secret Key length:', process.env.CASHFREE_SECRET_KEY?.length || 0);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Test creating a simple order
async function testOrder() {
    try {
        const request = {
            order_amount: "100.00",
            order_currency: "INR",
            customer_details: {
                customer_id: "test_user",
                customer_name: "Test User",
                customer_email: "test@example.com",
                customer_phone: "9999999999"
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment/status?order_id={order_id}`
            }
        };

        console.log('\nRequest details:', JSON.stringify(request, null, 2));
        console.log('\nAttempting to create test order...');
        const response = await cashfree.PGCreateOrder(request);
        console.log('Test order created successfully:', response.data);
    } catch (error) {
        console.error('\nError creating test order:', error.response?.data || error);
        console.error('\nFull error details:', error);
    }
}

testOrder(); 