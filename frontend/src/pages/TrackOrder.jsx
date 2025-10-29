import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    tracking: false,
    details: false
  });

  // Mock order data with tracking information
  const [order] = useState({
    orderId: 'ORD-001',
    name: 'Pancit',
    description: 'Traditional Filipino stir-fried noodles with vegetables and meat',
    price: 80.00,
    quantity: 3,
    image: bowlImage,
    status: 'preparing',
    orderDate: '2025-08-10',
    timeOrdered: '10:00 AM',
    estimatedDelivery: '11:45 AM',
    customerName: 'Pancit',
    progress: 65,
    trackingSteps: [
      { id: 1, title: 'Order Placed', description: 'Your order has been received', time: '10:00 AM', completed: true },
      { id: 2, title: 'Order Confirmed', description: 'Restaurant confirmed your order', time: '10:05 AM', completed: true },
      { id: 3, title: 'Preparing', description: 'Your food is being prepared', time: '10:15 AM', completed: true, current: true },
      { id: 4, title: 'Ready for Pickup', description: 'Your order is ready', time: 'Estimated 11:30 AM', completed: false },
      { id: 5, title: 'Completed', description: 'Order delivered/picked up', time: 'Estimated 11:45 AM', completed: false }
    ]
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
    switch (status) {
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

  return (
    <div className="min-h-screen relative font-sans">
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
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
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
              View Order
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <button onClick={() => navigate('/orders')} className="hover:text-yellow-600 font-medium">Orders</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Track Order</span>
            </div>
            <div className="flex space-x-3">
              <button
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
                onClick={() => navigate(`/view-order/${order.orderId}`)}
              >
                View Order
              </button>
              <button
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                onClick={() => navigate('/orders')}
              >
                Cancel Order
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order #{order.orderId.split('-')[1]}</h2>
            <p className="text-gray-600">Estimated delivery: {order.estimatedDelivery}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Tracking */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${isVisible.tracking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                data-section="tracking"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h3>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>

                {/* Tracking Steps */}
                <div className="space-y-6">
                  {order.trackingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-start space-x-4 transition-all duration-500 ease-out ${isVisible.tracking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                      style={{
                        transitionDelay: isVisible.tracking ? `${200 + (index * 100)}ms` : '0ms'
                      }}
                    >
                      {/* Step Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                          ? 'bg-green-500 text-white'
                          : step.current
                            ? 'bg-yellow-400 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                        {step.completed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold">{step.id}</span>
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="flex-grow">
                        <h4 className={`font-bold text-lg ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm ${step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                          {step.description}
                        </p>
                        <p className={`text-xs font-medium mt-1 ${step.completed || step.current ? 'text-yellow-600' : 'text-gray-400'
                          }`}>
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details Sidebar */}
            <div>
              <div
                className={`bg-white rounded-xl border border-gray-200 p-6 sticky top-4 transition-all duration-1000 ease-out ${isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                data-section="details"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">Order Details</h3>

                {/* Order Item */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <img
                      src={order.image}
                      alt={order.name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-900">{order.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                    <p className="text-sm font-bold text-yellow-600">₱ {(order.price * order.quantity).toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-bold text-gray-900">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Time:</span>
                    <span className="font-bold text-gray-900">{order.timeOrdered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Delivery:</span>
                    <span className="font-bold text-yellow-600">{order.estimatedDelivery}</span>
                  </div>
                </div>

                <hr className="border-gray-200 mb-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">₱ {(order.price * order.quantity).toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate(`/view-order/${order.orderId}`)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl"
                >
                  View Full Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;