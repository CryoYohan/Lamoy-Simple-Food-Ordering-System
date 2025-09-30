import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ViewOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    orderDetails: false,
    summary: false
  });

  // Mock order data (in real app, fetch by orderId)
  const [order] = useState({
    orderId: 'ORD-001',
    name: 'Pancit',
    description: 'Traditional Filipino stir-fried noodles with vegetables and meat',
    price: 80.00,
    quantity: 3,
    image: bowlImage,
    status: 'complete',
    orderDate: '2025-08-10',
    timeOrdered: '10:00 AM',
    timeReceived: '11:30 AM',
    customerName: 'Pancit',
    progress: 100
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
          className={`transition-all duration-1000 ease-out ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            View Order
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Securely complete your order and choose your payment method.
          </p>
        </div>

        {/* Track Order button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate(`/track-order/${order.orderId}`)}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Track Order
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
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <button onClick={() => navigate('/orders')} className="hover:text-yellow-600 font-medium">Orders</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">View Order</span>
            </div>
            <button 
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate('/orders')}
            >
              Cancel Order
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order #{order.orderId.split('-')[1]}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Details */}
            <div>
              <div 
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.orderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="orderDetails"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Product Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Name:</span>
                    <span className="font-bold text-gray-900">{order.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <span className="font-bold text-gray-900">{order.quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Time Ordered:</span>
                    <span className="font-bold text-gray-900">{order.timeOrdered} ({order.orderDate})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Time Received:</span>
                    <span className="font-bold text-gray-900">{order.timeReceived} ({order.orderDate})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div 
                className={`bg-white rounded-xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                  isVisible.summary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="summary"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Name:</span>
                    <span className="font-bold text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <span className="font-bold text-gray-900">{order.quantity}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Time Ordered:</span>
                    <span className="font-bold text-gray-900">{order.timeOrdered} ({order.orderDate})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Time Received:</span>
                    <span className="font-bold text-gray-900">{order.timeReceived} ({order.orderDate})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Progress */}
          <div className="mt-8">
            <div 
              className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${
                isVisible.orderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Order Progression</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-yellow-400 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${order.progress}%` }}
                ></div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">{order.progress} %</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderPage;