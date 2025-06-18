import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const PaymentStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('order_id');

        if (!orderId) {
          throw new Error('Order ID not found');
        }

        const response = await axios.get(`${config.apiUrl}/payment/verify/${orderId}`);
        const orderStatus = response.data.order_status;

        if (orderStatus === 'PAID') {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          // Redirect to orders page after 3 seconds
          setTimeout(() => navigate('/orders'), 3000);
        } else {
          setStatus('error');
          setMessage('Payment failed or is pending. Please try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Error verifying payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return (
    <div className="payment-status-container">
      <div className={`status-card ${status}`}>
        <h2>
          {status === 'loading' && 'Verifying Payment...'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'error' && 'Payment Error'}
        </h2>
        <p>{message}</p>
        {status === 'error' && (
          <button onClick={() => navigate(-1)} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus; 