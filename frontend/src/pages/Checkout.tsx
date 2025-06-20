import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { config } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true
});

// Load Cashfree SDK without Sentry
declare global {
  interface Window {
    Cashfree: any;
  }
}

const Checkout = () => {
  const { cartItems, totalAmount } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'online' // Default to online payment
  });
  const [loading, setLoading] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize Cashfree
  useEffect(() => {
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
      document.body.removeChild(script);
    };
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [cartItems, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.paymentMethod === 'online' && !cashfree) {
      toast({
        title: "Payment gateway not ready",
        description: "The payment gateway is still loading. Please try again in a moment.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const deliveryAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      if (formData.paymentMethod === 'cash_on_delivery') {
        // Create order with cash on delivery
        const response = await api.post('/orders', {
          items: cartItems,
          address: deliveryAddress,
          totalAmount,
          paymentMethod: 'cash_on_delivery'
        });

        if (response.data) {
          toast({
            title: "Order Placed Successfully",
            description: "Your order has been placed. You can pay when the order is delivered.",
          });
          navigate('/orders');
        }
      } else {
        // Create order with online payment
        const response = await api.post('/payments/create-order', {
          items: cartItems,
          deliveryAddress,
          totalAmount: totalAmount.toString(),
          paymentMethod: 'online'
        });

        if (response.data.success) {
          const { payment_session_id } = response.data.data;
          console.log('Payment session ID:', payment_session_id);
          if (!payment_session_id) {
            toast({
              title: "Payment Error",
              description: "Payment session ID is missing. Please try again.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          cashfree.checkout({
            paymentSessionId: payment_session_id,
            redirectTarget: "_self"
          });
        } else {
          toast({
            title: "Payment Error",
            description: response.data.message || "Failed to create payment session.",
            variant: "destructive"
          });
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process checkout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || (formData.paymentMethod === 'online' && !cashfree)}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId._id} className="flex justify-between">
                    <span>
                      {item.productId.name} x {item.quantity}
                    </span>
                    <span>₹{(item.productId.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 