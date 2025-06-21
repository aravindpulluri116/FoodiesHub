import React, { useState, useEffect } from 'react';
import { Home, Package, Phone, Settings, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/button';
import { Link, useLocation } from 'react-router-dom';
import { config } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    // Fetch user info on mount with better error handling
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/api/auth/me`, { 
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        
        // Ensure response.data is valid
        if (response.data && typeof response.data === 'object') {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('User not authenticated or API error:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${config.apiBaseUrl}/api/auth/logout`, { 
        withCredentials: true,
        timeout: 5000
      });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pickles Hub</h1>
              <p className="hidden md:block md:text-sm text-gray-600">Homemade with Love</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {location.pathname === '/' ? (
              <button
                onClick={() => scrollToSection('home')}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            )}
            {location.pathname === '/' ? (
              <button
                onClick={() => scrollToSection('products')}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Package size={20} />
                <span>Products</span>
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Package size={20} />
                <span>Products</span>
              </Link>
            )}
            {location.pathname === '/' ? (
              <button
                onClick={() => scrollToSection('contact')}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Phone size={20} />
                <span>Contact</span>
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <Phone size={20} />
                <span>Contact</span>
              </Link>
            )}
            {user && (
              <Link
                to="/my-orders"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-300"
              >
                <ShoppingBag size={20} />
                <span>My Orders</span>
              </Link>
            )}
          </nav>

          {/* User Info or Login Button */}
          <div className="ml-4 flex items-center space-x-2">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : user ? (
              <>
                {user.picture && (
                  <img src={user.picture} alt="User" className="w-8 h-8 rounded-full mr-2" />
                )}
                <span className="text-gray-700 font-semibold mr-2">{user.name || user.email}</span>
                {user.isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="flex items-center mr-2">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href={`${config.apiBaseUrl}/api/auth/google`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow transition-colors duration-300"
              >
                Login with <FontAwesomeIcon icon={faGoogle} />
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 relative z-50 bg-white rounded-md">
              <div className="flex flex-col space-y-4 pt-4">
                {location.pathname === '/' ? (
                  <button
                    onClick={() => scrollToSection('home')}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Home size={20} />
                    <span>Home</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Home size={20} />
                    <span>Home</span>
                  </Link>
                )}
                {location.pathname === '/' ? (
                  <button
                    onClick={() => scrollToSection('products')}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Package size={20} />
                    <span>Products</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Package size={20} />
                    <span>Products</span>
                  </Link>
                )}
                {location.pathname === '/' ? (
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Phone size={20} />
                    <span>Contact</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <Phone size={20} />
                    <span>Contact</span>
                  </Link>
                )}
                {user && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-2 flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 p-2"
                  >
                    <ShoppingBag size={20} />
                    <span>My Orders</span>
                  </Link>
                )}
                {/* User Info or Login Button for Mobile */}
                {loading ? (
                  <span className="text-gray-500 text-sm">Loading...</span>
                ) : user ? (
                  <div className="flex items-center space-x-2">
                    {user.picture && (
                      <img src={user.picture} alt="User" className="w-8 h-8 rounded-full mr-2" />
                    )}
                    <span className="text-gray-700 font-semibold mr-2">{user.name || user.email}</span>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="flex items-center mr-2">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="mx-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow transition-colors duration-300"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className='flex justify-center'>
                    <a
                    href={`${config.apiBaseUrl}/api/auth/google`}
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow transition-colors duration-300"
                  >
                    Login with Google
                  </a>
                  </div>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
