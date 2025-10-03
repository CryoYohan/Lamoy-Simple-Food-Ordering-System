import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/LOGO2.png";

const DynamicNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  // In navbar.jsx, enhance the useEffect:
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = storedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalItems);
      } catch (error) {
        console.error("Error updating cart count:", error);
        setCartCount(0);
      }
    };

    // Initial update
    updateCartCount();

    // Listen for custom cart update events
    window.addEventListener("cartUpdated", updateCartCount);

    // Listen for storage events (changes from other tabs)
    window.addEventListener("storage", updateCartCount);

    // Update when page becomes visible
    window.addEventListener("focus", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("focus", updateCartCount);
    };
  }, []);


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

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsProfileDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Enhanced navigation handlers that close mobile menu
  const handleHomeClickMobile = () => {
    handleHomeClick();
    closeMobileMenu();
  };

  const handleMenuClickMobile = () => {
    handleMenuClick();
    closeMobileMenu();
  };

  const handleOrdersClickMobile = () => {
    handleOrdersClick();
    closeMobileMenu();
  };

  const handleCartClickMobile = () => {
    handleCartClick();
    closeMobileMenu();
  };

  const handleSignUpClickMobile = () => {
    handleSignUpClick();
    closeMobileMenu();
  };

  const handleSignInClickMobile = () => {
    handleSignInClick();
    closeMobileMenu();
  };

  const handleLogoutMobile = () => {
    logout();
    navigate("/");
    closeMobileMenu();
  };

  const handleProfileMobile = () => {
    navigate("/profile");
    closeMobileMenu();
  };

  return (
    <>
      <nav className="bg-transparent py-4 relative">
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

            {/* Desktop Navigation Links - Only show when authenticated and not on auth pages */}
            {isAuthenticated &&
              location.pathname !== "/login" &&
              location.pathname !== "/signup" && (
                <div className="hidden md:flex flex-1 justify-center">
                  <div className="">
                    <div className="flex items-center space-x-8">
                      <button
                        onClick={handleHomeClick}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === "/home"
                          ? "bg-white text-yellow-500 shadow-md"
                          : "text-white hover:bg-white/20"
                          }`}
                      >
                        Home
                      </button>
                      <button
                        onClick={handleMenuClick}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === "/menu"
                          ? "bg-white text-yellow-500 shadow-md"
                          : "text-white hover:bg-white/20"
                          }`}
                      >
                        Menu
                      </button>
                      <button
                        onClick={handleOrdersClick}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === "/orders" || location.pathname.startsWith("/view-order") || location.pathname.startsWith("/track-order")
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

            {/* Desktop Right side - Cart and Profile or Auth buttons */}
            <div className="hidden md:flex items-center space-x-4 w-1/4 justify-end">
              {isAuthenticated ? (
                <>
                  {/* Cart Icon - Only show when not on auth pages */}
                  {location.pathname !== "/login" &&
                    location.pathname !== "/signup" && (
                      <div className="relative">
                        <button
                          onClick={handleCartClick}
                          className={`p-3 rounded-full text-white transition-all duration-200 shadow-lg ${location.pathname === '/cart'
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
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}

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
                            className={`w-4 h-4 text-white transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""
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
                              onClick={handleProfile}
                              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors duration-200 flex items-center space-x-2"
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
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="font-medium">View Profile</span>
                            </button>
                            <hr className="border-gray-100 my-1" />
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Cart Icon for Mobile - Only show when authenticated and not on auth pages */}
              {isAuthenticated &&
                location.pathname !== "/login" &&
                location.pathname !== "/signup" && (
                  <div className="relative">
                    <button
                      onClick={handleCartClick}
                      className={`p-3 rounded-full text-white transition-all duration-200 shadow-lg ${location.pathname === '/cart'
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
                    {cartCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                )}

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-full p-3 text-white transition-all duration-200 shadow-lg"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <img src={logo} alt="Lamoy Logo" className="h-12 w-auto" />
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {isAuthenticated ? (
              <>
                {/* User Profile Section */}
                <div className="p-6 bg-yellow-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {user?.name || user?.UserName || "Guest"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {user?.role || "Customer"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links - Only show when not on auth pages */}
                {location.pathname !== "/login" && location.pathname !== "/signup" && (
                  <div className="py-4">
                    <button
                      onClick={handleHomeClickMobile}
                      className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${location.pathname === "/home"
                        ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </button>
                    <button
                      onClick={handleMenuClickMobile}
                      className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${location.pathname === "/menu"
                        ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Menu</span>
                    </button>
                    <button
                      onClick={handleOrdersClickMobile}
                      className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${location.pathname === "/orders" || location.pathname.startsWith("/view-order") || location.pathname.startsWith("/track-order")
                        ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={handleCartClickMobile}
                      className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${location.pathname === "/cart"
                        ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v0a1 1 0 001 1h11" />
                        <circle cx="9" cy="20" r="1" />
                        <circle cx="20" cy="20" r="1" />
                      </svg>
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Profile Actions */}
                <div className="border-t border-gray-200 py-4">
                  <button
                    onClick={handleProfileMobile}
                    className="w-full text-left px-6 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={handleLogoutMobile}
                    className="w-full text-left px-6 py-4 text-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              /* Not authenticated - Auth buttons */
              <div className="p-6 space-y-4">
                <button
                  onClick={handleSignInClickMobile}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignUpClickMobile}
                  className="w-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              © 2025 Lamoy. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicNavigation;