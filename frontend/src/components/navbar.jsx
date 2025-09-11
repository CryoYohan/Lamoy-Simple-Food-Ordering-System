import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
    // Landingpage padung
  };

  const handleHomeClick = () => {
    navigate('/');
    // Homepage padung
  };

  const handleMenuClick = () => {
    navigate('/menu');
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-yellow-500">
      {/* Logo placeholder */}
      <button 
        onClick={handleLogoClick}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full cursor-pointer"></div>
      </button>

      {/* Navigation Links - Centered */}
      <div className="flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
        <button 
          onClick={handleHomeClick}
          className="text-white font-bold hover:text-yellow-100 transition-colors cursor-pointer"
        >
          Home
        </button>
        <button 
          onClick={handleMenuClick}
          className="text-white font-bold hover:text-yellow-100 transition-colors cursor-pointer"
        >
          Menu
        </button>
        <button 
          onClick={handleOrdersClick}
          className="text-white font-bold hover:text-yellow-100 transition-colors cursor-pointer"
        >
          Orders
        </button>
      </div>

      {/* Sign In Button */}
      <button 
        onClick={handleSignInClick}
        className="btn rounded-full btn-md btn-outline border-none bg-white/50 text-white hover:text-yellow-100"
      >
        Sign In
      </button>
    </nav>
  );
};

export default Navigation;
