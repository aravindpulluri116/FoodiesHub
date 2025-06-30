import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import CheckoutForm from '@/components/CheckoutForm';
import { Button } from '@/components/ui/button';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const totalAmount = useMemo(() => getTotalPrice(), [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <CheckoutForm
        totalAmount={totalAmount}
        items={cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price
        }))}
        onClose={() => navigate('/')} // Navigate home when checkout is cancelled
      />
    </div>
  );
};

export default CheckoutPage; 