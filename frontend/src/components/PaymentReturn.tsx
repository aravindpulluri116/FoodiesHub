import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { config } from '../config';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true
});

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');

        if (!orderId) {
          throw new Error('Missing order ID');
        }

        const response = await api.post('/payments/verify', {
          orderId
        });

        if (response.data.success) {
          setVerified(true);
          setPaymentDetails(response.data.data);
          toast({
            title: "Payment Successful",
            description: "Your order has been placed successfully.",
          });
        } else {
          setPaymentDetails(response.data.data);
          throw new Error(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: error.message || "Please contact support if the amount was deducted.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            {verified ? (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                {paymentDetails && (
                  <div className="mb-6 text-left">
                    <h3 className="font-semibold mb-2">Payment Details:</h3>
                    <p className="text-sm text-gray-600">Order Status: {paymentDetails.orderStatus}</p>
                    <p className="text-sm text-gray-600">Order ID: {paymentDetails.paymentDetails.order_id}</p>
                    <p className="text-sm text-gray-600">Amount: ₹{paymentDetails.paymentDetails.order_amount}</p>
                  </div>
                )}
                <Button
                  onClick={() => navigate('/my-orders')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  View My Orders
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h2>
                <p className="text-gray-600 mb-6">
                  {paymentDetails?.orderStatus === "ACTIVE" 
                    ? "Your payment is still processing. Please wait a moment and refresh this page."
                    : "Please contact support if the amount was deducted from your account."}
                </p>
                {paymentDetails && (
                  <div className="mb-6 text-left">
                    <h3 className="font-semibold mb-2">Payment Details:</h3>
                    <p className="text-sm text-gray-600">Order Status: {paymentDetails.orderStatus}</p>
                    <p className="text-sm text-gray-600">Order ID: {paymentDetails.paymentDetails.order_id}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Refresh Status
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    Return to Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReturn; 