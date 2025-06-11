import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart');
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

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    let message = "Hi, I'd like to order the following items from Sneha's Pickles:\n\n";
    
    cartItems.forEach(item => {
      message += `• ${item.productId.name} - Quantity: ${item.quantity} - ${formatPrice(item.productId.price)} each\n`;
    });
    
    message += `\nTotal Amount: ₹${getTotalPrice().toFixed(2)}\n\nPlease confirm my order. Thank you!`;
    
    // Use the specified phone number for WhatsApp
    const phoneNumber = "917981833625"; // +91 7981833625
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log("WhatsApp URL:", whatsappUrl);
    console.log("Message:", message);
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsOpen(false);
  };

  return (
    <>
      {/* Cart Button */}
      <div className="fixed top-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="relative bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg"
        >
          <ShoppingCart size={24} />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </div>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      activeTab === 'cart'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Cart ({cartItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      activeTab === 'wishlist'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Wishlist ({wishlistItems.length})
                  </button>
                </div>
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="p-2">
                  <X size={20} />
                </Button>
              </div>

              {/* Content */}
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
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.productId.image || '/placeholder.png'}
                                  alt={item.productId.name || 'Product'}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm">{item.productId.name || 'Unknown Product'}</h3>
                                  <p className="text-orange-600 font-bold">
                                    {formatPrice(item.productId.price)}
                                  </p>
                                  <div className="flex items-center mt-2 space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Minus size={16} />
                                    </Button>
                                    <span className="font-semibold">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                                      className="w-8 h-8 p-0"
                                    >
                                      <Plus size={16} />
                                    </Button>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.productId._id)}
                                  className="text-red-500 p-2"
                                >
                                  <X size={16} />
                                </Button>
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
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm">{item.name}</h3>
                                  <p className="text-orange-600 font-bold">{formatPrice(item.price)}</p>
                                  <Button
                                    onClick={() => addToCart(item)}
                                    className="mt-2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  onClick={() => removeFromWishlist(item._id)}
                                  className="text-red-500 p-2"
                                >
                                  <Heart size={16} fill="currentColor" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {activeTab === 'cart' && cartItems.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-orange-600">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Order via WhatsApp
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
