// Import Cashfree SDK
import { Cashfree } from "cashfree-pg";

// Initialize Cashfree
Cashfree.XClientId = import.meta.env.VITE_CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = import.meta.env.VITE_CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export const initializePayment = async (paymentSessionId: string) => {
    try {
        const checkoutOptions = {
            paymentSessionId,
            redirectTarget: "_self" // Opens in the same tab
        };

        await Cashfree.checkout(checkoutOptions);
    } catch (error) {
        console.error('Error initializing payment:', error);
        throw error;
    }
};

export default Cashfree; 