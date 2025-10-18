import React, { useState, useEffect } from 'react';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminViewOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    orderDetails: false,
    summary: false,
    statusUpdate: false
  });

  // Mock order data (in real app, fetch by orderId from API)
  const [order, setOrder] = useState({
    id: orderId,
    orderId: `ORD-${orderId}`,
    customerName: 'Maria Santos',
    customerEmail: 'maria.santos@email.com',
    customerPhone: '+63 912 345 6789',
    items: [
      { name: 'Chicken Adobo', quantity: 1, price: 150.00, image: bowlImage },
      { name: 'Pancit Canton', quantity: 1, price: 120.00, image: bowlImage }
    ],
    totalAmount: 270.00,
    status: 'preparing',
    orderDate: '2024-01-20T10:30:00Z',
    timeOrdered: '10:30 AM',
    timeReceived: null,
    deliveryAddress: '123 Main St, Manila, Metro Manila',
    specialInstructions: 'Extra spicy please',
    progress: 60,
    statusHistory: [
      { status: 'pending', timestamp: '2024-01-20T10:30:00Z', description: 'Order placed by customer' },
      { status: 'confirmed', timestamp: '2024-01-20T10:35:00Z', description: 'Order confirmed by restaurant' },
      { status: 'preparing', timestamp: '2024-01-20T10:45:00Z', description: 'Kitchen started preparing order' }
    ]
  });

  // Status options with their configurations
  const statusOptions = [
    { value: 'pending', label: 'Order Placed', color: 'bg-gray-100 text-gray-600', progress: 20 },
    { value: 'confirmed', label: 'Order Confirmed', color: 'bg-blue-100 text-blue-600', progress: 40 },
    { value: 'preparing', label: 'Preparing', color: 'bg-yellow-100 text-yellow-600', progress: 60 },
    { value: 'ready', label: 'Ready for Pickup', color: 'bg-purple-100 text-purple-600', progress: 80 },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-600', progress: 100 }
  ];

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
    return statusConfig ? statusConfig.label : status;
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

  const handleStatusUpdate = (newStatus) => {
    const statusConfig = statusOptions.find(option => option.value === newStatus);
    if (!statusConfig) return;

    // Update order status and progress
    setOrder(prevOrder => ({
      ...prevOrder,
      status: newStatus,
      progress: statusConfig.progress,
      statusHistory: [
        ...prevOrder.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          description: `Status updated to ${statusConfig.label} by admin`
        }
      ]
    }));

    // In a real app, you would make an API call here to update the order status
    console.log(`Order ${order.orderId} status updated to ${newStatus}`);
  };

  const getNextStatus = () => {
    const currentIndex = statusOptions.findIndex(option => option.value === order.status);
    return currentIndex < statusOptions.length - 1 ? statusOptions[currentIndex + 1] : null;
  };

  const getPreviousStatus = () => {
    const currentIndex = statusOptions.findIndex(option => option.value === order.status);
    return currentIndex > 0 ? statusOptions[currentIndex - 1] : null;
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
              <span className="text-gray-900 font-semibold">Order Details</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order #{order.orderId.split('-')[1]}</h2>
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
                    <span className="font-bold text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Email:</span>
                    <span className="font-bold text-gray-900">{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Phone:</span>
                    <span className="font-bold text-gray-900">{order.customerPhone}</span>
                  </div>
                  <div className="border-t pt-4">
                    <span className="text-gray-800 font-medium">Delivery Address:</span>
                    <p className="font-bold text-gray-900 mt-1">{order.deliveryAddress}</p>
                  </div>
                  {order.specialInstructions && (
                    <div className="border-t pt-4">
                      <span className="text-gray-800 font-medium">Special Instructions:</span>
                      <p className="font-bold text-gray-900 mt-1 italic">"{order.specialInstructions}"</p>
                    </div>
                  )}
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
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-gray-700 text-sm font-medium">Quantity: {item.quantity}x</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₱{(item.quantity * item.price).toFixed(2)}</p>
                        <p className="text-gray-700 text-sm font-medium">₱{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">₱{order.totalAmount.toFixed(2)}</span>
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
                <div className="grid md:grid-cols-2 gap-4">
                  {getPreviousStatus() && (
                    <button
                      onClick={() => handleStatusUpdate(getPreviousStatus().value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
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
                      className="w-full p-4 border-2 border-yellow-500 bg-yellow-50 rounded-lg text-yellow-800 hover:bg-yellow-100 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Advance to {getNextStatus().label} →</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <div className="col-span-full w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <span className="text-green-800 font-medium">✓ Order Completed</span>
                    </div>
                  )}
                </div>

                {/* All Status Options */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Status Change:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusUpdate(status.value)}
                        disabled={status.value === order.status}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          status.value === order.status
                            ? 'bg-gray-100 text-gray-700 cursor-not-allowed font-medium'
                            : 'bg-white border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 text-gray-800'
                        }`}
                      >
                        <span className="font-medium text-sm">{status.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
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
              {/* Header with title and complete status */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Progression</h3>
                <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium">
                  Complete
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className="bg-yellow-400 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{order.progress} %</span>
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Status History:</h4>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        history.status === order.status ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{getStatusLabel(history.status)}</span>
                          <span className="text-xs text-gray-700 font-medium">{formatDate(history.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{history.description}</p>
                      </div>
                    </div>
                  ))}
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