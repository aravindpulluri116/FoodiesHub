import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'react-hot-toast';
import { config } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  address: string;
  payment?: {
    method: 'cash_on_delivery' | 'online';
    status: 'completed' | 'pending' | 'failed';
  };
}

const AdminPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setIsAuthenticated(true);
      fetchOrders();
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Please log in to access the admin panel');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
      setFilteredOrders(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      const errorDetails = error.response?.data?.error || '';
      toast.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      setLoading(false);
    }
  };

  // Filter orders based on status and payment filters
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment?.status === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, paymentFilter]);

  const handlePlaceOrder = async (orderId: string) => {
    try {
      console.log('Placing order:', orderId);
      const response = await api.post(`/admin/orders/${orderId}/place`);
      console.log('Place order response:', response.data);
      toast.success('Order placed successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to place order';
      const errorDetails = error.response?.data?.error || '';
      toast.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('Cancelling order:', orderId);
      const response = await api.post(`/admin/orders/${orderId}/cancel`);
      console.log('Cancel order response:', response.data);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order';
      const errorDetails = error.response?.data?.error || '';
      toast.error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
    }
  };

  // For Google OAuth login, use:
  const googleLoginUrl = `${config.apiUrl}/auth/google`;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Orders</h1>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Order Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="placed">Placed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Payment Status:</label>
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="completed">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
      
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order._id} className="p-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                <p className="text-sm text-gray-600">Customer: {order.user.name}</p>
                <p className="text-sm text-gray-600">Email: {order.user.email}</p>
                <p className="text-sm text-gray-600">Address: {order.address}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {/* Order Status */}
                <span className={`px-4 py-2 rounded-full text-base font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                
                {/* Payment Status */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.payment?.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment?.status === 'completed' ? '🟢 Paid' :
                   order.payment?.status === 'failed' ? '🔴 Failed' :
                   '🟡 Pending'}
                </span>
                
                {/* Payment Method */}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {order.payment?.method === 'cash_on_delivery' ? '💵 COD' : '💳 Online'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.product?.name || 'Product not available'} x {item.quantity} - ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-lg font-semibold text-orange-700">
                Total: ₹{order.totalAmount.toFixed(2)}
              </div>
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => handlePlaceOrder(order._id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Placed
                  </Button>
                )}
                {(order.status === 'pending' || order.status === 'placed') && (
                  <Button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel; 