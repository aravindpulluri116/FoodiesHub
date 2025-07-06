import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'react-hot-toast';
import { config } from '../config';

// Add a modal component for order details
import ReactModal from 'react-modal';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaCreditCard, FaSyncAlt, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [openDropdownOrderId, setOpenDropdownOrderId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdownOrderId && dropdownRefs.current[openDropdownOrderId]) {
        if (!dropdownRefs.current[openDropdownOrderId]?.contains(event.target as Node)) {
          setOpenDropdownOrderId(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownOrderId]);

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

  // Add search and pagination
  const filtered = filteredOrders.filter(order =>
    order.user.name.toLowerCase().includes(search.toLowerCase()) ||
    order.user.email.toLowerCase().includes(search.toLowerCase()) ||
    order._id.toLowerCase().includes(search.toLowerCase())
  );
  const ordersToShow = showAll ? filtered : filtered.slice(0, 10);

  // Add status change handler
  const handleChangeStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.post(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status changed to ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change status');
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
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel - Orders</h1>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or order ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm w-64"
          />
        </div>
        {/* ... existing filters ... */}
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
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>
      {/* Orders List */}
      <div className="grid gap-6">
        {ordersToShow.length === 0 && (
          <div className="text-center text-gray-400 py-12">No orders found.</div>
        )}
        {ordersToShow.map((order) => (
          <Card key={order._id} className="overflow-hidden max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-0">
            <div className="p-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Order <span className='text-gray-500 font-mono'>{order._id}</span></h2>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Customer:</span> {order.user.name}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold">Email:</span> {order.user.email}</p>
                </div>
                <div className="flex justify-end items-center space-x-2">
                  {/* Order Status Badge with controlled dropdown */}
                  <div className="relative" ref={el => (dropdownRefs.current[order._id] = el)}>
                    <button
                      className={`px-4 py-2 rounded-full text-base font-semibold shadow-md focus:outline-none flex items-center space-x-2
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}
                      `}
                      onClick={e => {
                        e.stopPropagation();
                        setOpenDropdownOrderId(openDropdownOrderId === order._id ? null : order._id);
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      <FaChevronDown className="ml-1 text-xs" />
                    </button>
                    {openDropdownOrderId === order._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-20">
                        {['pending', 'placed'].map(status => (
                          <button
                            key={status}
                            onClick={e => {
                              e.stopPropagation();
                              handleChangeStatus(order._id, status);
                              setOpenDropdownOrderId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                            disabled={order.status === status}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Payment Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center space-x-1
                    ${order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.payment?.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {order.payment?.status === 'completed' ? <FaCheckCircle className="text-green-500" /> :
                      order.payment?.status === 'failed' ? <FaTimesCircle className="text-red-500" /> :
                      <FaSyncAlt className="text-yellow-500 animate-spin" />}
                    <span>{order.payment?.status === 'completed' ? 'Paid' : order.payment?.status === 'failed' ? 'Failed' : 'Pending'}</span>
                  </span>
                  {/* Payment Method Badge */}
                  <span className="px-3 py-1 rounded-full text-sm font-semibold shadow flex items-center space-x-1 bg-gray-100 text-gray-800">
                    {order.payment?.method === 'cash_on_delivery' ? <FaMoneyBillWave className="text-green-600" /> : <FaCreditCard className="text-blue-600" />}
                    <span>{order.payment?.method === 'cash_on_delivery' ? 'COD' : 'Online'}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2 text-gray-700">Items:</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800">
                        {item.product?.name || 'Product not available'} x {item.quantity}
                      </span>
                      <span className="text-gray-700">₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2 text-gray-700">Delivery Address:</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{order.address}</p>
              </div>

              <div className="mt-4 flex flex-col space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Payment:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow ${
                    order.payment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.payment?.status === 'failed' ? 'bg-red-100 text-red-800' :
                    order.payment?.method === 'cash_on_delivery' ? 'bg-gray-200 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment?.status === 'completed' ? 'Paid' : 
                     order.payment?.status === 'failed' ? 'Payment Failed' :
                     order.payment?.method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-orange-700">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    {(order.status === 'pending' || order.status === 'placed') && (
                      <Button
                        onClick={e => { e.stopPropagation(); handleCancelOrder(order._id); }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Show more/less button for pagination */}
      {filtered.length > 10 && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setShowAll(!showAll)} variant="outline">
            {showAll ? <><FaChevronUp className="inline mr-1" /> Show Less</> : <><FaChevronDown className="inline mr-1" /> Show More</>}
          </Button>
        </div>
      )}
      {/* Order Details Modal */}
      <ReactModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Order Details"
        className="max-w-lg mx-auto mt-24 bg-white rounded-xl shadow-2xl p-8 outline-none border border-gray-200"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
        ariaHideApp={false}
      >
        {modalOrder && (
          <div>
            <h2 className="text-xl font-bold mb-4">Order #{modalOrder._id}</h2>
            <div className="mb-2 text-gray-700">Customer: {modalOrder.user.name}</div>
            <div className="mb-2 text-gray-700">Email: {modalOrder.user.email}</div>
            <div className="mb-2 text-gray-700">Address: {modalOrder.address}</div>
            <div className="mb-2 text-gray-700">Date: {new Date(modalOrder.createdAt).toLocaleDateString()}</div>
            <div className="mb-2 text-gray-700">Status: <span className="font-semibold">{modalOrder.status}</span></div>
            <div className="mb-2 text-gray-700">Payment: <span className="font-semibold">{modalOrder.payment?.status} ({modalOrder.payment?.method})</span></div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="space-y-2">
                {modalOrder.items.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    {item.product?.name || 'Product not available'} x {item.quantity} - ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-lg font-semibold text-orange-700 mb-4">
              Total: ₹{modalOrder.totalAmount.toFixed(2)}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setModalOpen(false)} variant="outline">Close</Button>
            </div>
          </div>
        )}
      </ReactModal>
    </div>
  );
};

export default AdminPanel; 