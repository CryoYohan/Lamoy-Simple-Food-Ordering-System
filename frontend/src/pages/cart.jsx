import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    cartItems: false,
    summary: false
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // Set hero section visible immediately on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cart items state with proper management
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Pancit',
      description: 'Test description',
      price: 80.00,
      quantity: 1,
      image: bowlImage
    },
    {
      id: 2,
      name: 'Pancit',
      description: 'Test description',
      price: 80.00,
      quantity: 1,
      image: bowlImage
    },
    {
      id: 3,
      name: 'Pancit',
      description: 'Test description',
      price: 80.00,
      quantity: 1,
      image: bowlImage
    }
  ]);

  // Update quantity function
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item function
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>
      
      {/* Upper background image with centered header content */}
      <div 
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div 
          className={`transition-all duration-1000 ease-out ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            My Cart
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Review the items you've added and make changes before placing your order
          </p>
        </div>

        {/* Browse button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate('/menu')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Browse +
            </button>
          </div>
        </div>
      </div>

      {/* Cart Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div 
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${
              isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <button onClick={() => navigate('/menu')} className="hover:text-yellow-600 font-medium">Menu</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Cart</span>
            </div>
            <button 
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shopping Cart */}
            <div className="lg:col-span-2">
              <div 
                className={`bg-white rounded-xl p-10 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.cartItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="cartItems"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h2>
                <p className="text-gray-700 mb-6 font-medium">Cart Items ({cartItems.length})</p>
                
                {/* Cart Items */}
                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-500 ease-out ${
                        isVisible.cartItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ 
                        transitionDelay: isVisible.cartItems ? `${200 + (index * 100)}ms` : '0ms'
                      }}
                    >
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-gray-700 text-sm font-medium">{item.description}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mr-6">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded flex items-center justify-center transition-colors"
                        >
                          <span className="text-gray-700 font-medium text-lg">-</span>
                        </button>
                        <span className="min-w-[2rem] text-center font-medium text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded flex items-center justify-center transition-colors"
                        >
                          <span className="text-gray-700 font-medium text-lg">+</span>
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right mr-4">
                        <div className="bg-yellow-100 text-yellow-400 px-4 py-1.5 rounded-full font-medium text-sm">
                          ₱ {item.price.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 rounded flex items-center justify-center transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div 
                className={`bg-white rounded-xl border border-gray-200 p-6 sticky top-4 transition-all duration-1000 ease-out ${
                  isVisible.summary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="summary"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">{item.name} x{item.quantity}</span>
                      <span className="font-bold text-gray-900">₱ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <hr className="border-gray-200 mb-6" />
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">₱ {total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Proceed Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;