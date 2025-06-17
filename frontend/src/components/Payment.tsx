import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import PhoneNumberUpdate from './PhoneNumberUpdate';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface PaymentProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const Payment: React.FC<PaymentProps> = ({ amount, orderId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);
      console.log('Initiating payment for order:', orderId);
      
      // Get user phone from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        setShowPhoneUpdate(true);
        return;
      }
      
      // First, test if the payment routes are accessible
      try {
        const testResponse = await api.get('/payment/test');
        console.log('Payment routes test:', testResponse.data);
      } catch (error) {
        console.error('Payment routes test failed:', error);
      }
      
      const response = await api.post('/payment/create-order', {
        amount,
        orderId,
        phone: userPhone,
        note: `Payment for order ${orderId}`
      });

      console.log('Payment response:', response.data);

      if (response.data && response.data.order_id) {
        // Use the correct hosted checkout URL format
        const paymentUrl = `https://sandbox.cashfree.com/pg/orders/${response.data.order_id}/payments/${response.data.payment_session_id}/hosted`;
        
        // Create a form to submit with the proper headers
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentUrl;
        
        // Add version header
        const versionInput = document.createElement('input');
        versionInput.type = 'hidden';
        versionInput.name = 'x-api-version';
        versionInput.value = '2025-01-01';
        form.appendChild(versionInput);
        
        // Add the form to the document and submit it
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('Order ID not received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.response?.data?.message || 'Failed to initiate payment',
        variant: 'destructive'
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneUpdateSuccess = () => {
    setShowPhoneUpdate(false);
    handlePayment();
  };

  if (showPhoneUpdate) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold mb-2">Phone Number Required</h2>
            <p className="text-gray-600">Please add your phone number to proceed with the payment.</p>
          </div>
          <PhoneNumberUpdate onSuccess={handlePhoneUpdateSuccess} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Complete Your Payment</h2>
          <p className="text-lg font-medium text-orange-600 mb-4">₹{amount.toFixed(2)}</p>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Payment; 