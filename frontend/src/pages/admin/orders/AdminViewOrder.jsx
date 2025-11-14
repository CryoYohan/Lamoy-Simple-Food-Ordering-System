import React, { useState, useEffect } from 'react';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getOrderById, updateOrderStatus } from '../../../services/orderService';
import { API_BASE_URL } from '../../../apiConfig';
import Toast from '../../../components/Toast';

const AdminViewOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    orderDetails: false,
    summary: false,
    statusUpdate: false
  });

  // Status options mapping to backend OrderStatus enum
  const statusOptions = [
    { value: 1, label: 'Pending', color: 'bg-gray-100 text-gray-600', progress: 20 },
    { value: 2, label: 'Preparing', color: 'bg-yellow-100 text-yellow-600', progress: 50 },
    { value: 3, label: 'Ready', color: 'bg-purple-100 text-purple-600', progress: 75 },
    { value: 4, label: 'Delivered', color: 'bg-green-100 text-green-600', progress: 100 },
    { value: 5, label: 'Cancelled', color: 'bg-red-100 text-red-600', progress: 0 }
  ];

  // Fetch order data on mount
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!isAuthenticated || user?.role !== 'Admin') {
        setError('Unauthorized access. Admin privileges required.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
        setToast({
          type: 'error',
          message: err.message || 'Failed to load order details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, isAuthenticated, user]);

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
  }, [loading]);

  // Set hero section visible immediately on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return statusConfig ? statusConfig.color : 'bg-gray-100 text-gray-600';
  };

  const getStatusLabel = (status) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return statusConfig ? statusConfig.label : 'Unknown';
  };

  const getProgressPercentage = (status) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return statusConfig ? statusConfig.progress : 0;
  };

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

  const handleStatusUpdate = async (newStatus) => {
    if (order.status === 5) { // Cancelled
      setToast({
        type: 'warning',
        message: 'Cannot update a cancelled order'
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const updatedOrder = await updateOrderStatus(orderId, { status: newStatus });
      setOrder(updatedOrder);
      setToast({
        type: 'success',
        message: `Order status updated to ${getStatusLabel(newStatus)}`
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to update order status'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getNextStatus = () => {
    if (!order || order.status === 5) return null; // Cancelled
    const currentIndex = statusOptions.findIndex(option => option.value === order.status);
    if (currentIndex === -1 || currentIndex >= 3) return null; // No next status after Delivered
    return statusOptions[currentIndex + 1];
  };

  const getPreviousStatus = () => {
    if (!order || order.status === 5 || order.status === 1) return null; // Cancelled or Pending
    const currentIndex = statusOptions.findIndex(option => option.value === order.status);
    if (currentIndex <= 0) return null;
    return statusOptions[currentIndex - 1];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-700">Loading order details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50">
          <AdminNavigation />
        </div>
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center p-8 bg-white rounded-xl border border-red-200 shadow-lg max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
            <p className="text-gray-700 mb-6">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      
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
            Order Details
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            View and manage order details, update status, and track progress
          </p>
        </div>

        {/* Back to Orders button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate('/admin/orders')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div 
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${
              isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <button onClick={() => navigate('/admin/dashboard')} className="hover:text-yellow-600 font-medium">Admin</button>
              <span>/</span>
              <button onClick={() => navigate('/admin/orders')} className="hover:text-yellow-600 font-medium">Orders</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Order #{order.orderId}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order #{order.orderId}</h2>
            <p className="text-gray-800 font-medium">Placed on {formatDate(order.orderDate)}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <div 
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.orderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="orderDetails"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Name:</span>
                    <span className="font-bold text-gray-900">{order.userName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">User ID:</span>
                    <span className="font-bold text-gray-900">#{order.userId}</span>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-gray-800 font-medium">Delivery Address:</span>
                    <p className="font-bold text-gray-900 mt-1">{order.deliveryAddress || 'No address provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div 
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.orderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
                
                <div className="space-y-4">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <div key={item.orderItemId || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img 
                              src={`${API_BASE_URL.replace('/api', '')}${item.imageUrl}`}
                              alt={item.itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                              }}
                            />
                          ) : (
                            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                          <p className="text-gray-700 text-sm font-medium">Quantity: {item.quantity}x</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₱{(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items in this order</p>
                    </div>
                  )}
                </div>

                {/* Order Total */}
                <div className="border-t mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">₱{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Update Order Status - Full Width Section */}
          <div className="mt-8">
            <div 
              className={`bg-white rounded-xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                isVisible.statusUpdate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              data-section="statusUpdate"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Update Order Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-800 font-medium">Current Status:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Status Action Buttons */}
                {order.status !== 5 && order.status !== 4 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {getPreviousStatus() && (
                      <button
                        onClick={() => handleStatusUpdate(getPreviousStatus().value)}
                        disabled={isUpdatingStatus}
                        className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">← Back to {getPreviousStatus().label}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </div>
                      </button>
                    )}

                    {getNextStatus() && (
                      <button
                        onClick={() => handleStatusUpdate(getNextStatus().value)}
                        disabled={isUpdatingStatus}
                        className="w-full p-4 border-2 border-yellow-500 bg-yellow-50 rounded-lg text-yellow-800 hover:bg-yellow-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {isUpdatingStatus ? 'Updating...' : `Advance to ${getNextStatus().label} →`}
                          </span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {order.status === 4 && (
                  <div className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                    <span className="text-green-800 font-medium">✓ Order Delivered</span>
                  </div>
                )}

                {order.status === 5 && (
                  <div className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                    <span className="text-red-800 font-medium">✕ Order Cancelled</span>
                  </div>
                )}

                {/* All Status Options */}
                {order.status !== 5 && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Quick Status Change:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {statusOptions.filter(s => s.value !== 5).map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusUpdate(status.value)}
                          disabled={status.value === order.status || isUpdatingStatus}
                          className={`p-3 rounded-lg text-center transition-colors ${
                            status.value === order.status
                              ? 'bg-gray-100 text-gray-700 cursor-not-allowed font-medium'
                              : 'bg-white border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium text-sm">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Progress - Full Width Section */}
          <div className="mt-8">
            <div 
              className={`bg-white rounded-xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                isVisible.summary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              data-section="summary"
            >
              {/* Header with title and status */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Progress</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              {/* Progress Bar */}
              {order.status !== 5 && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                        order.status === 4 ? 'bg-green-500' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${getProgressPercentage(order.status)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{getProgressPercentage(order.status)}%</span>
                  </div>
                </div>
              )}

              {/* Order Information */}
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Order Date</p>
                  <p className="text-gray-900 font-bold">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Order ID</p>
                  <p className="text-gray-900 font-bold">#{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Items Count</p>
                  <p className="text-gray-900 font-bold">{order.orderItems?.length || 0} item(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Total Amount</p>
                  <p className="text-gray-900 font-bold">₱{order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewOrder;