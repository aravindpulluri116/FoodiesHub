
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Products from '../components/Products';
import Contact from '../components/Contact';
import Cart from '../components/Cart';
import { CartProvider } from '../contexts/CartContext';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <Header />
        <main>
          <Hero />
          <Products />
          <Contact />
        </main>
        <Cart />
      </div>
    </CartProvider>
  );
};

export default Index;
