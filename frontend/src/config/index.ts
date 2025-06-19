export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://foodieshubbackend.vercel.app/api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://foodieshubbackend.vercel.app',
  cashfreeSdkUrl: import.meta.env.VITE_CASHFREE_SDK_URL,
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER,
  googleMapsUrl: import.meta.env.VITE_GOOGLE_MAPS_URL
}; 