import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/LOGO2.png';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMenuClick = () => {
    navigate('/menu');
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-transparent py-5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={logo} 
              alt="Lamoy Logo" 
              className="h-15 w-auto cursor-pointer"
              onClick={handleHomeClick}
            />
          </div>
          
          {/* Navigation Links - Centered with pill background */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-8 py-3">
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => navigate('/')}
                  className={`text-white/80 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/30 ${isLandingPage ? '' : ''}`}
                >
                  Home
                </button>
                <button 
                  onClick={handleMenuClick}
                  className="text-white/80 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/30"
                >
                  Menu
                </button>
                <button 
                  onClick={handleOrdersClick}
                  className="text-white/80 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/30"
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
          
          {/* Sign In Button */}
          <div>
            <button 
              onClick={handleSignInClick}
              className="bg-white/20 hover:bg-white-400 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md backdrop-blur-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
