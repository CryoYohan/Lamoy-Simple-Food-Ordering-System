import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/LOGO2.png";

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  

  const handleHomeClick = () => {
    navigate("/admin/dashboard");
  };

  const handleOrdersClick = () => {
    navigate("/admin/orders");
  };

  const handleMenuClick = () => {
    navigate("/admin/menu");
  };

  const handleReportsClick = () => {
    navigate("/admin/reports");
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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

  const handleOrdersClickMobile = () => {
    handleOrdersClick();
    closeMobileMenu();
  };

  const handleMenuClickMobile = () => {
    handleMenuClick();
    closeMobileMenu();
  };

  const handleReportsClickMobile = () => {
    handleReportsClick();
    closeMobileMenu();
  };


  const handleLogoutMobile = () => {
    logout();
    navigate("/");
    closeMobileMenu();
  };

  // Check if current path is active
  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
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

            {/* Desktop Navigation Links - Admin specific */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="">
                <div className="flex items-center space-x-8">
                  <button
                    onClick={handleHomeClick}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/dashboard")
                        ? "bg-white text-yellow-500 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleOrdersClick}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/orders")
                        ? "bg-white text-yellow-500 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={handleMenuClick}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/menu")
                        ? "bg-white text-yellow-500 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={handleReportsClick}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive("/admin/reports")
                        ? "bg-white text-yellow-500 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Right side - Profile */}
            <div className="hidden md:flex items-center space-x-4 w-1/4 justify-end">
              {/* Profile Dropdown */}
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
                      {user?.name || user?.UserName || "Admin"}
                    </div>
                    <div className="text-xs text-white/70">
                      Administrator
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
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Admin Badge Mobile */}
              <div className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-red-300/30">
                ADMIN
              </div>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="bg-white/25 hover:bg-white/35 backdrop-blur-md rounded-full p-3 text-white transition-all duration-200 shadow-lg"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isMobileMenuOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
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
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Lamoy Logo" className="h-12 w-auto" />
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                ADMIN
              </span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Profile Section */}
            <div className="p-6 bg-yellow-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {user?.name || user?.UserName || "Admin"}
                  </div>
                  <div className="text-sm text-gray-600">Administrator</div>
                </div>
              </div>
            </div>

            {/* Admin Navigation Links */}
            <div className="py-4">
              <button
                onClick={handleHomeClickMobile}
                className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${
                  isActive("/admin/dashboard")
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleOrdersClickMobile}
                className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${
                  isActive("/admin/orders")
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>Orders</span>
              </button>
              <button
                onClick={handleMenuClickMobile}
                className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${
                  isActive("/admin/menu")
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Menu</span>
              </button>
              <button
                onClick={handleReportsClickMobile}
                className={`w-full text-left px-6 py-4 text-lg font-medium transition-colors flex items-center space-x-3 ${
                  isActive("/admin/reports")
                    ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Reports</span>
              </button>
            </div>

            {/* Profile Actions */}
            <div className="border-t border-gray-200 py-4">
              <button
                onClick={handleLogoutMobile}
                className="w-full text-left px-6 py-4 text-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              © 2025 Lamoy Admin Panel
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminNavigation;