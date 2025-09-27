import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/LOGO2.png";

const DynamicNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleHomeClick = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  const handleMenuClick = () => {
    navigate("/menu");
  };

  const handleOrdersClick = () => {
    navigate("/orders");
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleSignInClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav className="bg-transparent py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 w-1/4">
            <img
              src={logo}
              alt="Lamoy Logo"
              className="h-16 w-auto cursor-pointer"
              onClick={handleHomeClick}
            />
          </div>

          {/* Navigation Links - Only show when authenticated and not on auth pages */}
          {isAuthenticated &&
            location.pathname !== "/login" &&
            location.pathname !== "/signup" && (
              <div className="hidden md:flex flex-1 justify-center">
                <div className="">
                  <div className="flex items-center space-x-8">
                    <button
                      onClick={handleHomeClick}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        location.pathname === "/home"
                          ? "bg-white text-yellow-500 shadow-md"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      Home
                    </button>
                    <button
                      onClick={handleMenuClick}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        location.pathname === "/menu"
                          ? "bg-white text-yellow-500 shadow-md"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      Menu
                    </button>
                    <button
                      onClick={handleOrdersClick}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        location.pathname === "/orders"
                          ? "bg-white text-yellow-500 shadow-md"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Right side - Cart and Profile or Auth buttons */}
          <div className="flex items-center space-x-4 w-1/4 justify-end">
            {isAuthenticated ? (
              <>
                {/* Cart Icon - Only show when not on auth pages */}
                {location.pathname !== "/login" &&
                  location.pathname !== "/signup" && (
                    <div className="relative">
                      <button 
                        onClick={handleCartClick}
                        className={`p-3 rounded-full text-white transition-all duration-200 shadow-lg ${
                          location.pathname === '/cart'
                            ? 'bg-white text-yellow-500'
                            : 'bg-white/25 hover:bg-white/35 backdrop-blur-md'
                        }`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v0a1 1 0 001 1h11"
                          />
                          <circle cx="9" cy="20" r="1" />
                          <circle cx="20" cy="20" r="1" />
                        </svg>
                      </button>
                      {/* Cart count badge */}
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    </div>
                  )}

                {/* Profile Dropdown - Only show when not on auth pages */}
                {location.pathname !== "/login" &&
                  location.pathname !== "/signup" && (
                    <div className="relative">
                      <button
                        onClick={toggleProfileDropdown}
                        className="bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-full p-2 pr-4 flex items-center space-x-3 text-white transition-all duration-200 shadow-lg"
                      >
                        {/* Profile Avatar */}
                        <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>

                        {/* User Info */}
                        <div className="text-left hidden sm:block">
                          <div className="text-sm font-semibold text-white">
                            {user?.name || user?.UserName || "Guest"}
                          </div>
                          <div className="text-xs text-white/70">
                            {user?.role || "Customer"}
                          </div>
                        </div>

                        {/* Dropdown Arrow */}
                        <svg
                          className={`w-4 h-4 text-white transition-transform duration-200 ${
                            isProfileDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            <span className="font-medium">Log Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </>
            ) : (
              <>
                {/* Authentication buttons for different pages */}
                {location.pathname === "/" && (
                  <>
                    <button
                      onClick={handleSignInClick}
                      className="bg-white/25 hover:bg-white/35 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md backdrop-blur-md cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleSignUpClick}
                      className="bg-white text-yellow-500 hover:bg-gray-50 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </>
                )}

                {/* Show Sign Up - in Login page */}
                {location.pathname === "/login" && (
                  <button
                    onClick={handleSignUpClick}
                    className="bg-white text-yellow-500 hover:bg-gray-50 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    Sign Up
                  </button>
                )}

                {/* Show Sign In - in Signup page */}
                {location.pathname === "/signup" && (
                  <button
                    onClick={handleSignInClick}
                    className="bg-white text-yellow-500 hover:bg-gray-50 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default DynamicNavigation;