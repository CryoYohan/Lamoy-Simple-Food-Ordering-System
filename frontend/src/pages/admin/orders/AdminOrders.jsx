import React, { useState, useEffect } from 'react';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Static order data (in real app, this would come from API)
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: 'ORD-1247',
      customerName: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      items: [
        { name: 'Chicken Adobo', quantity: 1, price: 150.00, image: bowlImage },
        { name: 'Pancit Canton', quantity: 1, price: 120.00, image: bowlImage }
      ],
      totalAmount: 270.00,
      status: 'pending',
      orderDate: '2024-01-20T10:30:00Z',
      deliveryAddress: '123 Main St, Manila',
      specialInstructions: 'Extra spicy please'
    },
    {
      id: 2,
      orderId: 'ORD-1246',
      customerName: 'Juan Dela Cruz',
      customerEmail: 'juan.delacruz@email.com',
      items: [
        { name: 'Bicol Express', quantity: 2, price: 130.00, image: bowlImage },
        { name: 'Rice', quantity: 2, price: 25.00, image: bowlImage }
      ],
      totalAmount: 310.00,
      status: 'confirmed',
      orderDate: '2024-01-20T09:15:00Z',
      deliveryAddress: '456 Oak Ave, Quezon City',
      specialInstructions: ''
    },
    {
      id: 3,
      orderId: 'ORD-1245',
      customerName: 'Ana Rodriguez',
      customerEmail: 'ana.rodriguez@email.com',
      items: [
        { name: 'Lechon Kawali', quantity: 1, price: 180.00, image: bowlImage },
        { name: 'Pancit', quantity: 1, price: 100.00, image: bowlImage }
      ],
      totalAmount: 280.00,
      status: 'preparing',
      orderDate: '2024-01-20T08:45:00Z',
      deliveryAddress: '789 Pine St, Makati',
      specialInstructions: 'Call before delivery'
    },
    {
      id: 4,
      orderId: 'ORD-1244',
      customerName: 'Carlos Miguel',
      customerEmail: 'carlos.miguel@email.com',
      items: [
        { name: 'Halo-Halo', quantity: 2, price: 90.00, image: bowlImage },
        { name: 'Lumpia', quantity: 3, price: 60.00, image: bowlImage }
      ],
      totalAmount: 360.00,
      status: 'ready',
      orderDate: '2024-01-20T07:20:00Z',
      deliveryAddress: '321 Elm St, Pasig',
      specialInstructions: 'Ring doorbell twice'
    },
    {
      id: 5,
      orderId: 'ORD-1243',
      customerName: 'Sofia Reyes',
      customerEmail: 'sofia.reyes@email.com',
      items: [
        { name: 'Sisig', quantity: 1, price: 160.00, image: bowlImage },
        { name: 'Rice', quantity: 2, price: 25.00, image: bowlImage }
      ],
      totalAmount: 210.00,
      status: 'completed',
      orderDate: '2024-01-19T18:30:00Z',
      deliveryAddress: '654 Maple Dr, Taguig',
      specialInstructions: ''
    },
    {
      id: 6,
      orderId: 'ORD-1242',
      customerName: 'Mark Johnson',
      customerEmail: 'mark.johnson@email.com',
      items: [
        { name: 'Adobo Rice Bowl', quantity: 1, price: 120.00, image: bowlImage }
      ],
      totalAmount: 120.00,
      status: 'pending',
      orderDate: '2024-01-19T16:15:00Z',
      deliveryAddress: '789 Cedar St, Makati',
      specialInstructions: 'Leave at door'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(4); // Match customer orders page

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    ordersList: false
  });

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
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

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Set hero section visible immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get status color based on order progression
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600'; // Order Placed
      case 'confirmed':
        return 'bg-blue-100 text-blue-600'; // Order Confirmed
      case 'preparing':
        return 'bg-yellow-100 text-yellow-600'; // Preparing
      case 'ready':
        return 'bg-purple-100 text-purple-600'; // Ready for Pickup
      case 'completed':
        return 'bg-green-100 text-green-600'; // Completed
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get status text for display
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle order status updates
  const handleAcceptOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'confirmed' }
          : order
      )
    );
  };

  const handleStartPreparing = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'preparing' }
          : order
      )
    );
  };

  const handleMarkReady = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'ready' }
          : order
      )
    );
  };

  const handleCompleteOrder = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' }
          : order
      )
    );
  };

  const handleViewDetails = (orderId) => {
    navigate(`/admin/orders/view/${orderId}`);
  };

  return (
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <AdminNavigation />
      </div>
      
      {/* Hero Section */}
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
            Manage Orders
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Review, accept, and manage all customer orders from one central location
          </p>
        </div>

        {/* Browse button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Dashboard +
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
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Management</h2>
                  <p className="text-gray-600 font-medium">Order Items ({filteredOrders.length})</p>
                </div>
                
                {/* Search and Filter Section */}
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
                      <option value="pending">Order Placed</option>
                      <option value="confirmed">Order Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready for Pickup</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Clear filters button */}
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

              {/* Results Summary */}
              {(searchTerm || filterStatus !== 'all') && (
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} 
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== 'all' && ` with status "${getStatusText(filterStatus)}"`}
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
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Main Item Image */}
                      <div className="w-20 h-20 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <img 
                          src={order.items[0].image} 
                          alt={order.items[0].name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      
                      {/* Order Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-900">{order.orderId}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium mb-1">{order.customerName}</p>
                        <p className="text-gray-500 text-sm mb-1">{order.customerEmail}</p>
                        <p className="text-gray-500 text-sm">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    
                    {/* Total Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₱{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.name}</span>
                          <span className="font-medium text-gray-900">₱{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Information:</h4>
                    <p className="text-sm text-gray-700 mb-1">{order.deliveryAddress}</p>
                    {order.specialInstructions && (
                      <p className="text-sm text-gray-600 italic">Special Instructions: {order.specialInstructions}</p>
                    )}
                  </div>

                  {/* Quick Status Change Section - Cleaned up */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                    
                    {/* Current Status Display */}
                    <div className="mb-4">
                      <span className="text-sm text-gray-600 font-medium">Current Status: </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    {/* Status Navigation Buttons */}
                    <div className="space-y-2">
                      {/* Back to Previous Status */}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => setOrders(prevOrders =>
                            prevOrders.map(o =>
                              o.id === order.id ? { ...o, status: 'pending' } : o
                            )
                          )}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          ← Back to Order Placed
                        </button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => setOrders(prevOrders =>
                            prevOrders.map(o =>
                              o.id === order.id ? { ...o, status: 'confirmed' } : o
                            )
                          )}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          ← Back to Order Confirmed
                        </button>
                      )}
                      
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => setOrders(prevOrders =>
                            prevOrders.map(o =>
                              o.id === order.id ? { ...o, status: 'preparing' } : o
                            )
                          )}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          ← Back to Preparing
                        </button>
                      )}

                      {/* Advance to Next Status */}
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleAcceptOrder(order.id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          Advance to Order Confirmed →
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStartPreparing(order.id)}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          Advance to Preparing →
                        </button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => handleMarkReady(order.id)}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          Advance to Ready for Pickup →
                        </button>
                      )}
                      
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleCompleteOrder(order.id)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                        >
                          Complete Order →
                        </button>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="w-full text-center py-3">
                          <span className="text-green-700 font-semibold text-sm bg-green-100 px-4 py-2 rounded-lg border border-green-200 inline-flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            Order Completed ✓
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => handleViewDetails(order.id)}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm transition-colors"
                    >
                      View Details →
                    </button>
                    
                    {/* Move status-specific buttons to Quick Status Change section above */}
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
                    : "No orders have been placed yet."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
                  >
                    Go to Dashboard
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

export default AdminOrders;