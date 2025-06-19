export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://foodieshubbackend.vercel.app/api',
  cashfreeSdkUrl: import.meta.env.VITE_CASHFREE_SDK_URL || 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'https://foodieshub-two.vercel.app'
}; 