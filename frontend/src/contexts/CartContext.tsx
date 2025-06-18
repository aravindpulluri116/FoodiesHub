import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { config } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface WishlistItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  formatPrice: (price: number) => string;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.productId.price * item.quantity);
  }, 0);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const response = await api.get('/api/cart');
      if (response.data) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      const response = await api.get('/api/wishlist');
      const data = response.data || [];
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string) => {
    if (!Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item?.productId?._id === productId);
  };

  // Fetch cart and wishlist on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCart(), fetchWishlist()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = async (product: Product) => {
    try {
      const response = await api.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
      });
      
      if (response.data) {
        setCartItems(response.data);
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await api.delete(`/api/cart/remove/${productId}`);
      if (response.data) {
        setCartItems(response.data);
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart.",
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await api.put(`/api/cart/update/${productId}`, { quantity });
      if (response.data) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addToWishlist = async (product: Product) => {
    try {
      const response = await api.post('/api/wishlist/add', {
        productId: product._id
      });
      
      if (response.data) {
        const data = response.data || [];
        setWishlistItems(Array.isArray(data) ? data : []);
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await api.delete(`/api/wishlist/remove/${productId}`);
      if (response.data) {
        const data = response.data || [];
        setWishlistItems(Array.isArray(data) ? data : []);
        toast({
          title: "Removed from Wishlist",
          description: "Item has been removed from your wishlist.",
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item?.productId?.price) return total;
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/api/cart/clear');
      if (response.data) {
        setCartItems([]);
        toast({
          title: "Cart Cleared",
          description: "Your cart has been cleared.",
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getTotalItems,
      getTotalPrice,
      clearCart,
      formatPrice,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
