import React, { useState, useEffect, useCallback } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png'; // Fallback image
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 1. Import services and helpers
import { getOrderById, cancelOrder } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../apiConfig'; // For image URLs

// Component renamed to reflect its purpose
const ViewOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams(); // Get orderId from URL
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // State for fetched order data
  const [order, setOrder] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    orderDetails: false, // Keep states from static version
    summary: false,
    orderProgress: false // Add state for progress section
  });
  // Animation useEffects
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true }));
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));
    // Set hero visible immediately
    const timer = setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []); // Run animation setup once


  // --- Fetch Order Data ---
  const fetchOrderDetails = useCallback(async () => {
    // Ensure orderId is valid before fetching
    if (!isAuthenticated || !orderId || isNaN(parseInt(orderId))) {
      if (isAuthenticated && orderId && isNaN(parseInt(orderId))) {
        showError("Invalid Order ID provided.");
        navigate('/orders', { replace: true });
      }
      return;
    }

    console.log(`Fetching details for order ID: ${orderId}`);
    setLoading(true);
    setError(null);
    try {
      const fetchedOrderDto = await getOrderById(orderId); // Use service
      console.log("Fetched Order DTO:", fetchedOrderDto);

      // Map DTO to state structure
      const mapped = mapDtoToState(fetchedOrderDto);
      setOrder(mapped);

      // Trigger content animations after data is fetched
      const timer = setTimeout(() => {
        // Trigger all content sections together or stagger if preferred
        setIsVisible(prev => ({ ...prev, content: true, orderDetails: true, summary: true, orderProgress: true }));
      }, 150); // Small delay after loading finishes


    } catch (err) {
      console.error('Error fetching order details:', err);
      const errorMsg = `Failed to load order details: ${err.message}.`;
      setError(errorMsg);
      showError(errorMsg);
      if (err.message.includes('404')) navigate('/orders', { replace: true, state: { message: "Order not found.", type: "error" } });
      else if (err.message.includes('401')) navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [orderId, isAuthenticated, navigate, showError]);

  // Trigger fetch on load/auth change
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (!authIsLoading && isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [authIsLoading, isAuthenticated, orderId, fetchOrderDetails, navigate]);

  // --- Helper Functions ---
  const getStatusString = (statusEnum) => { /* ... */ switch (statusEnum) { case 1: return 'Pending'; case 2: return 'Preparing'; case 3: return 'Ready'; case 4: return 'Delivered'; case 5: return 'Cancelled'; default: return 'Unknown'; } };
  const getStatusColor = (statusString) => { /* ... */ switch (statusString?.toLowerCase()) { case 'delivered': return 'bg-green-100 text-green-600'; case 'ready': return 'bg-orange-100 text-orange-600'; case 'preparing': return 'bg-yellow-100 text-yellow-600'; case 'pending': return 'bg-gray-100 text-gray-600'; case 'cancelled': return 'bg-red-100 text-red-600'; default: return 'bg-gray-100 text-gray-600'; } };
  // Function to calculate progress based on status (similar to track order)
  const calculateProgress = (statusString) => {
    const statusLower = statusString?.toLowerCase();
    if (statusLower === 'pending') return 10;
    if (statusLower === 'preparing') return 40;
    if (statusLower === 'ready') return 75;
    if (statusLower === 'delivered') return 100;
    if (statusLower === 'cancelled') return 0; // Or 100 with red color?
    return 0;
  };
  const getImageUrl = (item) => {
    if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
      // Remove '/api' from API_BASE_URL if it exists
      const baseUrl = API_BASE_URL.replace('/api', '');
      const path = item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`;
      
      // If the path already starts with http, return it as-is
      if (path.startsWith('http')) return path;
      
      // Construct full URL
      return `${baseUrl}${path}`;
    }
    return bowlImage;
  }

  // --- Map Backend DTO to Component State ---
  const mapDtoToState = (dto) => {
    if (!dto) return null;
    const statusString = getStatusString(dto.status);
    const progress = calculateProgress(statusString); // Calculate progress
    const totalQuantity = dto.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return {
      orderId: dto.orderId.toString(),
      status: statusString,
      orderDate: new Date(dto.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      orderTime: new Date(dto.orderDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      totalPrice: dto.totalPrice ?? 0,
      totalQuantity: totalQuantity,
      deliveryAddress: dto.deliveryAddress,
      progress: progress, // Add progress
      // Map items with image URL construction
      items: dto.orderItems?.map(oi => ({
        orderItemId: oi.orderItemId,
        itemId: oi.itemId,
        name: oi.itemName ?? `Unknown (ID: ${oi.itemId ?? 'N/A'})`,
        quantity: oi.quantity,
        priceAtPurchase: oi.priceAtPurchase,
        description: oi.description ?? '',
        image: getImageUrl(oi) // Use helper
      })) ?? []
    };
  };


  // --- Cancel Handler ---
  const handleCancel = async () => {
    if (!order || order.status !== 'Pending') {
      showError("This order cannot be cancelled.");
      return;
    }
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      try {
        const response = await cancelOrder(order.orderId);
        showSuccess(response.message || `Order #${order.orderId} cancelled.`);
        // Update local state directly
        setOrder(prev => prev ? { ...prev, status: 'Cancelled', progress: calculateProgress('Cancelled') } : null);
      } catch (err) {
        console.error('Error cancelling order:', err);
        showError(`Failed to cancel order: ${err.message}`);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  // --- Render Logic ---
  if (authIsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-700">
            {authIsLoading ? "Verifying session..." : "Loading Order Details..."}
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return ( /* ... Error display ... */
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50"><DynamicNavigation /></div>
        <div className="pt-40 pb-20 flex flex-col items-center justify-center text-center px-4">
          {/* ... Error Icon ... */}
          <div className="w-20 h-20 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center"> <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-6 max-w-md">{error || "Could not load order details."}</p>
          <button onClick={() => navigate('/orders')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"> Back to My Orders </button>
        </div>
      </div>
    );
  }

  // --- Main JSX Return (Using Static Structure with Dynamic Data) ---
  return (
    <div className="min-h-screen relative font-sans bg-gray-50"> {/* Added bg */}
      <div className="absolute w-full z-50"><DynamicNavigation /></div>

      {/* Hero Section */}
      <div
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
      >
        <div
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Order Details {/* Updated Title */}
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Review the specifics of your order #{order.orderId}
          </p>
        </div>

        {/* Back to Orders button (Replaces Track Order button) */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={() => navigate('/orders')} // Changed onClick
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Back to Orders {/* Changed text */}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb & Conditional Cancel Button */}
          <div className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="content" >
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <button onClick={() => navigate('/orders')} className="hover:text-yellow-600 font-medium">My Orders</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Order #{order.orderId}</span>
            </div>
            {order.status === 'Pending' && (
              <button onClick={handleCancel} disabled={isCancelling} className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm" >
                {/* ... Cancel button content ... */}
                {isCancelling ? (<> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" >...</svg> Cancelling...</>) : (<> <svg className="w-4 h-4" >...</svg>Cancel Order</>)}
              </button>
            )}
          </div>

          {/* Order ID Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Order #{order.orderId}</h2>
          </div>

          {/* Main Grid (Using static structure) */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Details (Now iterates through items) */}
            <div>
              <div className={`bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm transition-all duration-1000 ease-out ${isVisible.orderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="orderDetails" style={{ transitionDelay: '200ms' }}>
                <h3 className="text-xl font-bold text-gray-800 mb-5">Product Details</h3>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {order.items.map((item, index) => (
                      <div key={item.orderItemId || index} className="flex items-start p-4 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="relative w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = bowlImage; e.target.className = "w-10 h-10 object-contain"; }} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-base text-gray-800 truncate" title={item.name}>{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-500">Price: ₱ {item.priceAtPurchase.toFixed(2)} each</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-bold text-gray-800 text-sm">₱ {(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No items found in this order.</p>
                )}
              </div>
            </div>

            {/* Order Summary (Right Panel) */}
            <div>
              <div className={`bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm transition-all duration-1000 ease-out ${isVisible.summary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="summary" style={{ transitionDelay: '400ms' }}>
                <h3 className="text-xl font-bold text-gray-800 mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between"><span className="text-gray-500">Order ID:</span><span className="font-medium text-gray-700">#{order.orderId}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-500">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>{order.status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Order Placed:</span><span className="font-medium text-gray-700">{order.orderDate} - {order.orderTime}</span></div>
                  <div className="flex justify-between items-start"><span className="text-gray-500 flex-shrink-0 mr-2">Deliver To:</span><span className="font-medium text-gray-700 text-right">{order.deliveryAddress}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Items:</span><span className="font-medium text-gray-700">{order.totalQuantity}</span></div>
                </div>
                <hr className="border-gray-100 mb-4" />
                {/* Item Subtotals */}
                <div className="space-y-1 text-xs mb-4 text-gray-500 max-h-24 overflow-y-auto pr-1">
                  {order.items.map((item, index) => (
                    <div key={`summary-item-${item.orderItemId || index}`} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₱ {(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-gray-200 mb-4" />
                <div className="flex justify-between items-center mb-5">
                  <span className="text-base font-bold text-gray-800">Total Amount:</span>
                  <span className="text-base font-bold text-gray-800">₱ {order.totalPrice.toFixed(2)}</span>
                </div>
                {/* REMOVED Back Button from here */}
              </div>
            </div>
          </div>

          {/* Order Progress (Using derived progress) */}
          <div className="mt-8">
            <div className={`bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm transition-all duration-1000 ease-out ${isVisible.orderProgress ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="orderProgress" style={{ transitionDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Order Progression</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}> {order.status} </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${order.progress}%` }}></div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-700">{order.progress}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderPage;

