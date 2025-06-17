import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CheckoutForm from './CheckoutForm';
import { config } from '../config';

// Load Cashfree SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}

const Cart = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { 
    cartItems, 
    wishlistItems, 
    removeFromCart, 
    updateQuantity, 
    removeFromWishlist,
    addToCart,
    getTotalItems, 
    getTotalPrice,
    clearCart,
    formatPrice 
  } = useCart();

  // Initialize Cashfree
  useEffect(() => {
    const script = document.createElement('script');
    script.src = config.cashfreeSdkUrl;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleOpenCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I'd like to order the following items:\n${cartItems.map(item => `- ${item.name} (${item.quantity})`).join('\n')}`;
    const whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-6 z-50 bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 flex items-center justify-center"
      >
        <ShoppingCart size={24} />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {getTotalItems()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`font-medium ${activeTab === 'cart' ? 'text-orange-600' : 'text-gray-600'}`}
                >
                  Cart ({getTotalItems()})
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`font-medium ${activeTab === 'wishlist' ? 'text-orange-600' : 'text-gray-600'}`}
                >
                  Wishlist ({wishlistItems.length})
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-orange-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'cart' ? (
                <>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.filter(item => item?.productId).map(item => (
                        <Card key={item.productId._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={item.productId.image}
                                alt={item.productId.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium">{item.productId.name}</h3>
                                <p className="text-sm text-gray-600">
                                  ₹{formatPrice(item.productId.price)}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.productId._id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Your wishlist is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlistItems.map(item => (
                        <Card key={item._id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-600">
                                  ₹{formatPrice(item.price)}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      addToCart(item);
                                      removeFromWishlist(item._id);
                                    }}
                                  >
                                    Add to Cart
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromWishlist(item._id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Place Order and WhatsApp Buttons */}
            {activeTab === 'cart' && cartItems.length > 0 && (
              <div className="p-4 border-t flex flex-col gap-2">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 w-full" 
                  onClick={handleOpenCheckout}
                >
                  Place Order
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 w-full" 
                  onClick={handleWhatsAppClick}
                >
                  Order via WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-4xl">
          <CheckoutForm
            totalAmount={getTotalPrice()}
            items={cartItems.map(item => ({
              productId: item.productId._id,
              quantity: item.quantity,
              price: item.productId.price
            }))}
            onClose={() => setCheckoutOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
