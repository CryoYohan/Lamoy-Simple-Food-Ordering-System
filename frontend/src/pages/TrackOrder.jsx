import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById, cancelOrder } from '../services/orderService';
import { API_BASE_URL } from '../apiConfig';
import Toast from '../components/Toast';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    tracking: false,
    details: false
  });

  // Status mapping to backend OrderStatus enum
  const statusMapping = {
    1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-600', progress: 20 },
    2: { label: 'Preparing', color: 'bg-blue-100 text-blue-600', progress: 50 },
    3: { label: 'Ready', color: 'bg-purple-100 text-purple-600', progress: 75 },
    4: { label: 'Delivered', color: 'bg-green-100 text-green-600', progress: 100 },
    5: { label: 'Cancelled', color: 'bg-red-100 text-red-600', progress: 0 }
  };

  // Fetch order data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        
        // Verify this order belongs to the logged-in user (unless admin)
        if (user?.role !== 'Admin' && orderData.userId !== user?.userId) {
          setError('You do not have permission to view this order');
          setToast({
            type: 'error',
            message: 'Unauthorized access to order'
          });
          return;
        }

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
  }, [orderId, isAuthenticated, user?.userId, user?.role, navigate]);

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

  const getTrackingSteps = (currentStatus) => {
    const steps = [
      { 
        id: 1, 
        status: 1,
        title: 'Order Placed', 
        description: 'Your order has been received',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
        )
      },
      { 
        id: 2, 
        status: 2,
        title: 'Preparing', 
        description: 'Your food is being prepared',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
          </svg>
        )
      },
      { 
        id: 3, 
        status: 3,
        title: 'Ready for Pickup', 
        description: 'Your order is ready',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.9 5.2c.1-.1.1-.3.1-.4-.1-.2-.3-.4-.5-.4h-3.4V2.5c0-.3-.2-.5-.5-.5h-11c-.3 0-.5.2-.5.5v1.9H2.6c-.2 0-.4.2-.5.4 0 .1 0 .3.1.4l1.7 2.6v11c0 .8.7 1.5 1.5 1.5h13.2c.8 0 1.5-.7 1.5-1.5v-11l1.8-2.6zM7.2 3.5h9.6v1.4H7.2V3.5zm11.3 15c0 .3-.2.5-.5.5H5.9c-.3 0-.5-.2-.5-.5v-10h13v10z"/>
          </svg>
        )
      },
      { 
        id: 4, 
        status: 4,
        title: 'Delivered', 
        description: 'Order completed',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z"/>
            <path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
        )
      }
    ];

    return steps.map(step => ({
      ...step,
      completed: currentStatus > step.status || (currentStatus === 4 && step.status <= 4),
      current: currentStatus === step.status
    }));
  };

  // Add cancel modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
    orderName: ''
  });

  const handleCancelOrder = async () => {
    // Open modal instead of browser confirm
    setCancelModal({
      isOpen: true,
      orderId: order.orderId,
      orderName: `Order #${order.orderId}`
    });
  };

  // Confirm cancel
  const confirmCancelOrder = async () => {
    try {
      setIsCancelling(true);
      await cancelOrder(cancelModal.orderId);
      setToast({
        type: 'success',
        message: 'Order cancelled successfully'
      });
      
      // Refresh order data
      const updatedOrder = await getOrderById(orderId);
      setOrder(updatedOrder);
      
      // Close modal
      setCancelModal({ isOpen: false, orderId: null, orderName: '' });
    } catch (err) {
      console.error('Error cancelling order:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to cancel order'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Cancel modal close
  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, orderId: null, orderName: '' });
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

  const getStatusInfo = (status) => {
    return statusMapping[status] || statusMapping[1];
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
          <span className="text-lg font-medium text-gray-700">Loading order tracking...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50">
          <DynamicNavigation />
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
              onClick={() => navigate('/orders')}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className="min-h-screen relative font-sans bg-white">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      
      {/* Cancel Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Cancel Order?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Are you sure you want to cancel <span className="font-semibold text-gray-900">{cancelModal.orderName}</span>?
            </p>
            <p className="text-gray-500 text-center mb-6 text-xs">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute w-full z-50">
        <DynamicNavigation />
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
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Track Order
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Follow your order's journey from kitchen to your table
          </p>
        </div>

        {/* View Order button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={() => navigate(`/view-order/${order.orderId}`)}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              View Order Details
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <button onClick={() => navigate('/orders')} className="hover:text-yellow-600 font-medium">Orders</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Track Order #{order.orderId}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={() => navigate(`/view-order/${order.orderId}`)}
              >
                View Details
              </button>
              {order.status !== 5 && order.status !== 4 && (
                <button
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order #{order.orderId}</h2>
            <p className="text-gray-700 font-medium">Placed on {formatDate(order.orderDate)}</p>
          </div>

          {/* Main Grid - Order Progress and Summary aligned with same height */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Tracking - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-6 sm:p-8 border border-gray-200 h-full flex flex-col transition-all duration-1000 ease-out ${isVisible.tracking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                data-section="tracking"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Progress</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Progress Bar */}
                {order.status !== 5 && (
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        order.status === 4 ? 'bg-green-500' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${statusInfo.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Cancelled Message */}
                {order.status === 5 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-800">Order Cancelled</h4>
                        <p className="text-sm text-red-700">This order has been cancelled.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking Steps - Food-related Icons */}
                {order.status !== 5 && (
                  <div className="space-y-6 flex-grow">
                    {trackingSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-start space-x-4 transition-all duration-500 ease-out ${isVisible.tracking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        style={{ transitionDelay: isVisible.tracking ? `${200 + (index * 100)}ms` : '0ms' }}
                      >
                        {/* Step Icon - Clean circular design */}
                        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          step.completed
                            ? 'bg-green-500 text-white shadow-lg'
                            : step.current
                              ? 'bg-yellow-400 text-white shadow-lg'
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step.completed ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          ) : (
                            <div className={step.current ? 'animate-pulse' : ''}>
                              {step.icon}
                            </div>
                          )}
                          
                          {/* Connecting line */}
                          {index < trackingSteps.length - 1 && (
                            <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-6 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}></div>
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="flex-grow pt-2">
                          <h4 className={`font-bold text-lg ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm ${step.completed || step.current ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {step.current && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide">
                                In Progress
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Details Sidebar - Same height with flex layout */}
            <div className="lg:col-span-1">
              <div
                className={`bg-white rounded-xl border border-gray-200 p-6 sticky top-4 h-full flex flex-col transition-all duration-1000 ease-out ${isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                data-section="details"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h3>

                {/* Order Items - Scrollable with max height */}
                <div className="space-y-3 mb-6 flex-grow overflow-y-auto max-h-80">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <div key={item.orderItemId || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-14 h-14 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={`${API_BASE_URL.replace('/api', '')}${item.imageUrl}`}
                              alt={item.itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                              }}
                            />
                          ) : (
                            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{item.itemName}</h4>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-yellow-600">₱{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No items</p>
                  )}
                </div>

                {/* Order Info - Fixed at bottom */}
                <div className="mt-auto">
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Order ID:</span>
                      <span className="font-bold text-gray-900">#{order.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Order Date:</span>
                      <span className="font-bold text-gray-900 text-xs">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Items:</span>
                      <span className="font-bold text-gray-900">{order.orderItems?.length || 0}</span>
                    </div>
                  </div>

                  <hr className="border-gray-200 mb-6" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-gray-900">₱{order.totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/view-order/${order.orderId}`)}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;