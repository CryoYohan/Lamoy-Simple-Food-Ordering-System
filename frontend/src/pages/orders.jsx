import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Static order data (in real app, this would come from API)
  const [orders] = useState([
    {
      id: 1,
      name: 'Pancit',
      description: 'Test description',
      price: 80.00,
      quantity: 1,
      image: bowlImage,
      status: 'complete',
      orderDate: '2024-01-15',
      orderId: 'ORD-001'
    },
    {
      id: 2,
      name: 'Chicken Adobo',
      description: 'The Philippines\' national dish! Tender chicken braised in soy sauce, vinegar, and garlic. Served with steamed rice.',
      price: 120.00,
      quantity: 2,
      image: bowlImage,
      status: 'preparing',
      orderDate: '2024-01-16',
      orderId: 'ORD-002'
    },
    {
      id: 3,
      name: 'Pancit',
      description: 'Test description',
      price: 80.00,
      quantity: 1,
      image: bowlImage,
      status: 'pending',
      orderDate: '2024-01-17',
      orderId: 'ORD-003'
    },
    {
      id: 4,
      name: 'Lumpia',
      description: 'Fresh spring rolls with vegetables',
      price: 60.00,
      quantity: 3,
      image: bowlImage,
      status: 'complete',
      orderDate: '2024-01-18',
      orderId: 'ORD-004'
    },
    {
      id: 5,
      name: 'Lechon Kawali',
      description: 'Crispy pork belly served with rice',
      price: 150.00,
      quantity: 1,
      image: bowlImage,
      status: 'preparing',
      orderDate: '2024-01-19',
      orderId: 'ORD-005'
    },
    {
      id: 6,
      name: 'Halo-Halo',
      description: 'Traditional Filipino dessert with mixed ingredients',
      price: 90.00,
      quantity: 2,
      image: bowlImage,
      status: 'pending',
      orderDate: '2024-01-20',
      orderId: 'ORD-006'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(4); // Show 4 orders per page

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'complete':
        return 'bg-green-100 text-green-600';
      case 'preparing':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case 'preparing':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.91-1.64 7.95-1.64s5.59.59 7.95 1.64c.03.28.05.57.05.86 0 4.41-3.59 8-8 8z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Handle order actions
  const handleViewOrder = (orderId) => {
    navigate(`/view-order/${orderId}`);
    // Implement view order logic
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
    // Implement track order logic
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      console.log('Cancel order:', orderId);
      // Implement cancel order logic
    }
  };

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    ordersList: false
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
            View Orders
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            See all your past and current orders in one place
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

      {/* Orders Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div 
              className={`flex flex-col gap-6 mb-6 transition-all duration-800 ease-out ${
                isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              data-section="content"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Order History</h2>
                  <p className="text-gray-600 font-medium">Order Items ({filteredOrders.length})</p>
                </div>
                
                {/* Simple Search and Filter Section - Right aligned */}
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search for orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 bg-white"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 bg-white appearance-none cursor-pointer min-w-[120px]"
                    >
                      <option value="all">Filter</option>
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="complete">Complete</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Clear filters button - only show when filters are active */}
                  {(searchTerm || filterStatus !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Results Summary - only show when filters are active */}
              {(searchTerm || filterStatus !== 'all') && (
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} 
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== 'all' && ` with status "${filterStatus}"`}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div 
            className={`space-y-4 transition-all duration-1000 ease-out ${
              isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            data-section="ordersList"
          >
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-out ${
                    isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: isVisible.ordersList ? `${200 + (index * 100)}ms` : '0ms'
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Order Info */}
                    <div className="flex items-center space-x-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <img 
                          src={order.image} 
                          alt={order.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-900">{order.name}</h3>
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{order.description}</p>
                        <p className="text-gray-500 text-sm font-medium">Quantity: {order.quantity}x</p>
                      </div>
                    </div>
                    
                    {/* Right side - Price and Actions */}
                    <div className="flex items-center space-x-6">
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* View Order Button */}
                        <button 
                          onClick={() => handleViewOrder(order.orderId)}
                          className="w-10 h-10 bg-white-100 hover:bg-yellow-200 text-yellow-500 hover:text-yellow-700 rounded-full flex items-center justify-center transition-colors border border-gray-200 hover:border-yellow-200"
                          title="View Order"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {/* Track Order Button */}
                        <button 
                          onClick={() => handleTrackOrder(order.orderId)}
                          className="w-10 h-10 bg-white-100 hover:bg-yellow-200 text-yellow-500 hover:text-yellow-700 rounded-full flex items-center justify-center transition-colors border border-gray-200 hover:border-yellow-200"
                          title="Track Order"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        
                        {/* Cancel Order Button - Only show if not complete */}
                        {order.status !== 'complete' && order.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center transition-colors"
                            title="Cancel Order"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* No Orders Found */
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? "No orders match your current search criteria." 
                    : "You haven't placed any orders yet."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => navigate('/menu')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
                  >
                    Start Ordering
                  </button>
                  {(searchTerm || filterStatus !== 'all') && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;