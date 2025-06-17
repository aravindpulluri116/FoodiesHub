// Test file for Cashfree SDK
import { Cashfree } from '@cashfreepayments/cashfree-js';

console.log('Cashfree SDK imported successfully:', Cashfree);

// Initialize Cashfree
const cashfree = new Cashfree({
    mode: import.meta.env.MODE === 'production' ? 'production' : 'sandbox'
});

console.log('Cashfree instance created:', cashfree);

export const testCashfree = async () => {
    try {
        console.log('Testing Cashfree initialization...');
        const checkoutOptions = {
            paymentSessionId: 'test_session_id',
            redirectTarget: "_self"
        };
        console.log('Checkout options:', checkoutOptions);
        await cashfree.checkout(checkoutOptions);
        console.log('Cashfree checkout successful');
    } catch (error) {
        console.error('Cashfree test error:', error);
        throw error;
    }
};

export default cashfree; 