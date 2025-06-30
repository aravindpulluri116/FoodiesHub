import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X, Plus, Minus, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckoutForm from "./CheckoutForm";
import { config } from "../config";
import { useMenu } from "@/contexts/MenuContext";
// Load Cashfree SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}

const Cart = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isMenuOpen } = useMenu();
  const [activeTab, setActiveTab] = useState<"cart" | "wishlist">("cart");
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
    formatPrice,
  } = useCart();

  // Initialize Cashfree
  useEffect(() => {
    const script = document.createElement("script");
    script.src = config.cashfreeSdkUrl;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleOpenCheckout = () => {
    setIsOpen(false);
    //navigate('/checkout');
    setTimeout(() => {
      //navigate('/checkout');
      window.location.href = "/checkout";
    }, 100);
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I'd like to order the following items:\n${cartItems
      .map((item) => `- ${item.name} (${item.quantity})`)
      .join("\n")}`;
    const whatsappUrl = `https://wa.me/${
      config.whatsappNumber
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {getTotalItems() > 0 && !isMenuOpen && (
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
      )}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border-0">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`font-medium ${
                    activeTab === "cart" ? "text-orange-600" : "text-gray-600"
                  }`}
                >
                  Cart ({getTotalItems()})
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`font-medium ${
                    activeTab === "wishlist"
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
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
              {activeTab === "cart" ? (
                <>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems
                        .filter((item) => item?.productId)
                        .map((item) => (
                          <Card key={item.productId} className="bg-white/90 rounded-xl shadow-lg border-0">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg shadow-md border border-gray-100"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.name}</h3>
                                  <p className="text-sm text-gray-600 mb-2">₹{formatPrice(item.price)}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.productId,
                                          item.quantity - 1
                                        )
                                      }
                                      className="p-1 rounded-full bg-gray-100 hover:bg-orange-100 shadow transition"
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <span className="font-semibold text-base">{item.quantity}</span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.productId,
                                          item.quantity + 1
                                        )
                                      }
                                      className="p-1 rounded-full bg-gray-100 hover:bg-orange-100 shadow transition"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.productId)}
                                  className="text-gray-400 hover:text-red-500 ml-2"
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
                      {wishlistItems.map((item) => (
                        <Card key={item.productId}>
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
                                      addToCart({
                                        _id: item.productId,
                                        name: item.name,
                                        price: item.price,
                                        image: item.image,
                                        description: '',
                                        category: '',
                                      });
                                      removeFromWishlist(item.productId);
                                    }}
                                  >
                                    Add to Cart
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      removeFromWishlist(item.productId)
                                    }
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
            {activeTab === "cart" && cartItems.length > 0 && (
              <div className="p-4 border-t flex flex-col gap-2 bg-gradient-to-br from-white to-gray-50 rounded-b-2xl">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-white font-semibold w-full text-lg py-3 rounded-xl"
                  onClick={handleOpenCheckout}
                >
                  Place Order
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-white font-semibold w-full text-lg py-3 rounded-xl"
                  onClick={handleWhatsAppClick}
                >
                  Order via WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
