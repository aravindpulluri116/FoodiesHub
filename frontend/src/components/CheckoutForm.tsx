import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { config } from '../config';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true
});

interface CheckoutFormProps {
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    image?: string;
    name: string;
  }>;
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ totalAmount, items, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [cashfree, setCashfree] = useState<any>(null);
  
  // Address form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    additionalInfo: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me'); // Assuming you have an endpoint to get user data
        if (response.data) {
          const { name, email, phone } = response.data;
          setFormData(prev => ({
            ...prev,
            fullName: name || '',
            email: email || '',
            phone: phone || ''
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        // Handle not being logged in, maybe redirect
      }
    };
    fetchUserData();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'phone', 'streetAddress', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Validation Error",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (paymentMethod === 'online' && !cashfree) {
      toast({
        title: "Payment gateway not ready",
        description: "The payment gateway is still loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const address = `${formData.streetAddress}, ${formData.city}, ${formData.state} - ${formData.pincode}${formData.additionalInfo ? ` (${formData.additionalInfo})` : ''}`;

      if (paymentMethod === 'cod') {
        // Handle COD order
        const response = await api.post('/orders', {
          items,
          address,
        });

        if (response.data) {
          toast({
            title: "Order Placed Successfully",
            description: "Your order has been placed. You will receive a confirmation shortly.",
          });
          onClose();
          navigate('/my-orders');
        }
      } else {
        // Handle online payment
        const response = await api.post('/payments/create-order', {
          items,
          deliveryAddress: address,
          phone: formData.phone
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
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 transform hover:scale-[1.02] transition-all duration-300 rounded-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
        <CardTitle className="text-2xl font-bold text-center">Checkout</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'cod' | 'online')}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Pay Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Qty</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.productId} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors duration-200`}>
                      <td className="py-3 px-4 flex items-center space-x-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shadow-md" />
                        )}
                        <span className="font-medium">{item.name}</span>
                      </td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <span className="text-gray-700 font-semibold text-lg">Total Amount:</span>
              <span className="text-2xl font-bold text-orange-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-white font-semibold"
              disabled={loading || (paymentMethod === 'online' && !cashfree)}
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm; 