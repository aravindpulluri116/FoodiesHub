import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { config } from '../config';
import axios from 'axios';

interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
}

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true
});

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        if (!orderId) {
          throw new Error('Order ID not found');
        }

        const response = await api.get<PaymentVerificationResponse>(`/payments/verify/${orderId}`);
        if (response.data.success) {
          setSuccess(true);
        } else {
          setError(response.data.message || 'Payment verification failed');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Verifying payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">
            {success ? 'Payment Successful' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {success ? (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <p className="text-center">
              {success
                ? 'Your payment was successful. Thank you for your purchase!'
                : error || 'Your payment could not be processed. Please try again.'}
            </p>
            <Button
              onClick={() => navigate(success ? '/' : '/cart')}
              className="mt-4"
            >
              {success ? 'Continue Shopping' : 'Back to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResult; 