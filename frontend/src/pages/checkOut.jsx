import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CheckOutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect to landing if not authenticated
  useEffect(() => {
      if (!isAuthenticated) {
      navigate('/');
      }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>
      {/* Upper background image with centered header content and sticky Browse button */}
      <div 
        className="relative top-0 left-0 w-full h-80 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-3">
          Checkout
        </h1>
        <p className="text-white/90 text-base sm:text-lg md:text-xl">
          Securely complete your order and choose your payment method.
        </p>

        {/* Browse button sticking out halfway below the image */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:bg-white/25">
          <button className="bg-white px-16 py-4 rounded-full font-bold text-lg text-yellow-500 hover:bg-gray-50 transition-colors cursor-pointer">
            Browse +
          </button>
        </div>
      </div>

      {/* Checkout Content Section - Below inside the white background */}
        <div className="bg-gray-50 py-8 relative pointer-events-auto">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Home</span>
                <span>/</span>
                <span>Cart</span>
                <span>/</span>
                <span className="text-gray-900 font-medium">Checkout</span>
              </div>
              <button className="btn px-10 py-6 bg-[#FDBE01] text-white" onClick={() => navigate('/cart')}>Back to Cart</button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shopping Cart */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-2">Shopping Cart</h2>
                  <p className="text-gray-600 text-sm mb-6">Cart Items (0)</p>
                  
                  {/* Cart Items - Empty State */}
                  <div className="space-y-4">
                    {/* Items will be dynamically rendered here */}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">User Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  
                  <div className="space-y-3">
                    {/* Payment items will be dynamically rendered here */}
                    
                    <hr className="my-4" />
                    
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₱ 0.00</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-yellow-400 text-white py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                    Complete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CheckOutPage;