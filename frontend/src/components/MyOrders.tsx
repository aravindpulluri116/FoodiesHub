import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Payment from './Payment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { config } from '@/config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true
});

// Load Cashfree SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'placed' | 'completed' | 'cancelled';
  address: string;
  createdAt: string;
  payment?: {
    method: 'cash_on_delivery' | 'online';
    status: 'completed' | 'pending' | 'failed';
  };
}

interface PaymentResponse {
  success: boolean;
  data: {
    payment_session_id: string;
  };
  message?: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    
    const script = document.createElement('script');
    script.src = config.cashfreeSdkUrl;
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        setCashfree(window.Cashfree({
          mode: 'sandbox' // or 'production'
        }));
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      const existingScript = document.querySelector(`script[src="${config.cashfreeSdkUrl}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      // Ensure orders is always an array
      setOrders(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    try {
      await api.post(`/orders/${orderToCancel}/cancel`);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
      fetchOrders(); // Refresh the orders list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  const handlePayNow = async (orderId: string) => {
    if (!cashfree) {
      toast({
        title: "Payment gateway not ready",
        description: "The payment gateway is still loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await api.post<PaymentResponse>('/payments/retry-payment', { orderId });

      if (response.data.success) {
        const { payment_session_id } = response.data.data;
        cashfree.checkout({
          paymentSessionId: payment_session_id,
          redirectTarget: "_self"
        });
      } else {
        throw new Error(response.data.message || 'Failed to create payment session.');
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.response?.data?.message || error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden max-w-3xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-end items-center">
                    <span className={`px-4 py-2 rounded-full text-base font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Items:</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name || 'Product not available'} x {item.quantity}
                        </span>
                        <span>₹{(item.product?.price || 0 * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Delivery Address:</h3>
                  <p className="text-sm text-gray-600">{order.address}</p>
                </div>

                <div className="mt-4 flex justify-between items-center border-t pt-4">
                  <span className="text-lg font-bold">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    {/* Show "Pay Now" for pending online orders OR placed COD orders */}
                    {((order.payment?.method === 'online' && order.status === 'pending') ||
                      (order.payment?.method === 'cash_on_delivery' && order.status === 'placed')) &&
                      order.status !== 'cancelled' && (
                      <Button onClick={() => handlePayNow(order._id)} disabled={processingPayment}>
                        {processingPayment ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}

                    {/* Show "Cancel" only for pending orders */}
                    {order.status === 'pending' && (
                      <Button variant="destructive" onClick={() => handleCancelClick(order._id)}>
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              No, Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
            >
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrders; 