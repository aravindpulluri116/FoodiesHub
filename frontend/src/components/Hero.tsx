
import React from 'react';

const Hero = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
              Authentic
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
                Homemade Pickles
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Experience the rich, traditional flavors of our handcrafted pickles. Made with love using time-honored recipes passed down through generations, each jar captures the authentic taste of homestyle Indian pickles.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">100% Natural Ingredients</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Traditional Family Recipes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Freshly Made Daily</span>
              </div>
            </div>
            <button
              onClick={scrollToProducts}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Explore Our Products
            </button>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80"
                alt="Traditional pickles in wooden bowls"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
