import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
}

interface CartItem {
  productId: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  formatPrice: (price: number | string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { toast } = useToast();

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/api/cart');
        // Add safety check for cart data
        const validCartItems = response.data.filter((item: any) => 
          item && item.productId && item.productId._id && item.quantity
        );
        setCartItems(validCartItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]); // Reset cart on error
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (product: Product) => {
    if (!product || !product._id) {
      console.error('Invalid product data');
      toast({
        title: "Error",
        description: "Invalid product data",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post('/api/cart/add', {
        productId: product._id,
        quantity: 1
      });

      setCartItems(prev => {
        const existingItem = prev.find(item => item.productId?._id === product._id);
        if (existingItem) {
          toast({
            title: "Updated Cart",
            description: `${product.name} quantity updated in cart`,
          });
          return prev.map(item =>
            item.productId?._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast({
            title: "Added to Cart",
            description: `${product.name} added to cart`,
          });
          return [...prev, { productId: product, quantity: 1 }];
        }
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Login Required",
          description: "Please login to add items to your cart",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive"
        });
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      setCartItems(prev => prev.filter(item => item.productId._id !== productId));
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Login Required",
          description: "Please login to manage your cart",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive"
        });
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    try {
      await api.put(`/api/cart/update/${productId}`, {
        quantity
      });
      setCartItems(prev =>
        prev.map(item =>
          item.productId._id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error: any) {
      console.error('Error updating cart:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Login Required",
          description: "Please login to update your cart",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update item quantity",
          variant: "destructive"
        });
      }
    }
  };

  const addToWishlist = (product: Product) => {
    setWishlistItems(prev => {
      if (prev.find(item => item._id === product._id)) {
        return prev;
      }
      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to wishlist`,
      });
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
    toast({
      title: "Removed from Wishlist",
      description: "Product removed from wishlist",
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item?.productId?.price) return total;
      const price = typeof item.productId.price === 'string' 
        ? parseFloat(item.productId.price.replace('₹', ''))
        : item.productId.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') {
      return price.startsWith('₹') ? price : `₹${price}`;
    }
    return `₹${price}`;
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart/clear');
      setCartItems([]);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Login Required",
          description: "Please login to manage your cart",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive"
        });
      }
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
      formatPrice
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
