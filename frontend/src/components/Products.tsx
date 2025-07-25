import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, formatPrice } = useCart();

  // Save scroll position before refresh
  useEffect(() => {
    const scrollPosition = window.scrollY;
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    });

    // Restore scroll position after refresh
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
      sessionStorage.removeItem('scrollPosition');
    }

    return () => {
      window.removeEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPosition', scrollPosition.toString());
      });
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'specials', name: 'Specials' },
    { id: 'biryanis', name: 'Biryanis' },
    { id: 'curries', name: 'Curries' },
    { id: 'non-veg', name: 'Non Veg' },
    { id: 'veg', name: 'Veg' },
    { id: 'pickles', name: 'Pickles' }
  ];

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        console.log('Fetching products from:', `${config.apiUrl}/products`);
        const response = await axios.get(`${config.apiUrl}/products`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        console.log('Products response:', response.data);
        if (!Array.isArray(response.data)) {
          console.error('Products response is not an array:', response.data);
          throw new Error('Invalid products data format');
        }
        return response.data;
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const filteredProducts = selectedCategory === 'all' 
    ? (Array.isArray(products) ? products : [])
    : (Array.isArray(products) ? products.filter((product: Product) => product.category === selectedCategory) : []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Loading...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-600 mb-4">Error loading products</h2>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our Delicious
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
              Food Collection
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our range of authentic homemade food, from traditional pickles to aromatic biryanis and flavorful curries.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-8 py-3 rounded-full font-semibold text-base shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105'}
              `}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product: Product) => (
            <div
              key={product._id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl hover:shadow-[0_8px_32px_rgba(255,140,0,0.25)] transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 border-0 overflow-hidden group flex flex-col min-h-[420px]"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {product.category === 'non-veg' ? 'Non Veg' : product.category}
                  </span>
                </div>
                <button
                  onClick={() => handleWishlistToggle(product)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                  <Heart 
                    size={20} 
                    className={`${
                      isInWishlist(product._id) 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    } transition-colors duration-300`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6 bg-white/90 rounded-b-2xl shadow-lg border border-gray-100 flex flex-col flex-1">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-xl font-bold text-orange-600">
                    ₹{formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <ShoppingCart size={16} />
                    <span className='text-[0.7rem] md:text-sm'>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
