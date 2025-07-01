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
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  _id: string;
}

interface WishlistItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
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
  // Initialize cartItems from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Calculate total amount with null checks
  const totalAmount = Array.isArray(cartItems) ? cartItems.reduce((total, item) => {
    if (!item?.price) return total;
    return total + (item.price * (item.quantity || 0));
  }, 0) : 0;

  // Sync cartItems to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  };

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      console.log('Wishlist response:', response.data);
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  };

  // Check if item is in wishlist with null check
  const isInWishlist = (productId: string) => {
    if (!Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item?.productId === productId);
  };

  // Get total items with null check
  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item?.quantity || 0), 0);
  };

  // Get total price with null check
  const getTotalPrice = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      if (!item?.price) return total;
      return total + (item.price * (item.quantity || 0));
    }, 0);
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
      console.log('Adding to cart - Product:', product);
      console.log('Sending request with:', { productId: product._id, quantity: 1 });
      const response = await api.post('/cart/add', {
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
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response && error.response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please login to add items to your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
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
      const response = await api.put(`/cart/update/${productId}`, { quantity });
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
      const response = await api.post('/wishlist/add', {
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
      console.log('Removing from wishlist - productId:', productId);
      const response = await api.delete(`/wishlist/remove/${productId}`);
      console.log('Remove wishlist response:', response.data);
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
      console.error('Error response:', error.response?.data);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart/clear');
      if (response.data) {
        setCartItems([]);
        localStorage.removeItem('cart');
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
