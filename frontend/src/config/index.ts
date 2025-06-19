interface Config {
  apiUrl: string;
  apiBaseUrl: string;
  cashfreeSdkUrl: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  frontendUrl?: string;
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://foodieshubbackend.vercel.app',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://foodieshubbackend.vercel.app',
  cashfreeSdkUrl: import.meta.env.VITE_CASHFREE_SDK_URL || 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
  googleMapsUrl: import.meta.env.VITE_GOOGLE_MAPS_URL || 'https://maps.google.com/?q=Ghatkesar,Hyderabad,India',
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'https://foodieshub-two.vercel.app'
}; 