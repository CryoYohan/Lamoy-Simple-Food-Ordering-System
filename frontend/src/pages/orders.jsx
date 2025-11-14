import React, { useState, useEffect, useCallback } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUserId, cancelOrder } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../apiConfig';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authIsLoading, isAuthenticated, navigate]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add cancel modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
    orderName: ''
  });

  // Helper function to construct image URL
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
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'Invalid Date'; }
  };

  // --- Data Fetching ---
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    let currentUserId = user?.userId;

    // Fallback: Try decoding token if userId not yet in context (might happen on initial load)
    if (!currentUserId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          currentUserId = decoded.userId || decoded.nameid;
          console.log('Using fallback ID from token:', currentUserId);
        } catch (err) {
          console.error('Error decoding token:', err);
          setError('Authentication error. Please log in again.');
          showError('Authentication error. Please log in again.');
          setLoading(false);
          navigate('/login');
          return;
        }
      }
    }

    if (!currentUserId) {
      setError('Could not determine user ID.');
      showError('Could not load orders. User ID missing.');
      setLoading(false);
      return;
    }

    console.log('Fetching orders for user:', currentUserId);
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrdersByUserId(currentUserId);
      console.log('API Response:', fetchedOrders);

      const mappedOrders = fetchedOrders.map(order => {
        const firstItem = order.orderItems?.[0];
        const firstItemName = firstItem?.itemName ?? 'Unknown Item';
        const totalQuantity = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
        const orderImage = firstItem ? getImageUrl(firstItem) : bowlImage;

        return {
          id: order.orderId,
          orderId: `ORD-${order.orderId}`,
          name: order.orderItems?.length > 1
            ? `${firstItemName} + ${order.orderItems.length - 1} more`
            : firstItemName,
          description: `Order #${order.orderId} • ${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          price: order.totalPrice?.toFixed(2) ?? '0.00',
          quantity: totalQuantity,
          image: orderImage,
          status: getStatusString(order.status),
          orderDate: order.orderDate,
          deliveryAddress: order.deliveryAddress,
          items: order.orderItems?.map(oi => ({
            name: oi.itemName,
            quantity: oi.quantity,
            price: oi.priceAtPurchase,
            image: getImageUrl(oi)
          })) ?? []
        };
      });

      setOrders(mappedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));

    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMsg = `Failed to load orders: ${err.message}. Please try again.`;
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId, showError, navigate]);

  // Fetch orders when authentication state is resolved and user ID is available
  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      fetchOrders();
    }
  }, [authIsLoading, isAuthenticated, fetchOrders]);

  // --- Helper Functions ---
  const getStatusString = (statusEnum) => {
    switch (statusEnum) {
      case 1: return 'Pending';
      case 2: return 'Preparing';
      case 3: return 'Ready';
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-600';
      case 'Preparing': return 'bg-yellow-100 text-yellow-600';
      case 'Ready': return 'bg-blue-100 text-blue-600';
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>;
      case 'preparing': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>;
      case 'pending': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>;
      case 'ready': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.71 8.71c-.39-.39-1.02-.39-1.41 0l-10.59 10.59-4.59-4.59c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l5.3 5.3c.39.39 1.02.39 1.41 0l11.3-11.3c.4-.39.4-1.02.01-1.41z" /></svg>;
      default: return null;
    }
  };


  // --- Filtering and Pagination State & Logic ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4; // Same as AdminOrders

  const filteredOrders = orders.filter(order => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      order.name.toLowerCase().includes(lowerSearch) ||
      order.orderId.toLowerCase().includes(lowerSearch);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);


  // --- Action Handlers ---
  const handleViewOrder = (orderId) => {
    navigate(`/view-order/${orderId.replace('ORD-', '')}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId.replace('ORD-', '')}`);
  };

  // Updated cancel handler to open modal
  const handleCancelOrder = (order) => {
    setCancelModal({
      isOpen: true,
      orderId: order.orderId,
      orderName: order.name
    });
  };

  // Confirm cancel
  const confirmCancelOrder = async () => {
    const numericId = cancelModal.orderId.replace('ORD-', '');
    try {
      const response = await cancelOrder(numericId);
      
      // Update state optimistically
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === cancelModal.orderId
            ? { ...order, status: 'Cancelled' }
            : order
        )
      );
      showSuccess(response.message || `${cancelModal.orderId} cancelled successfully.`);
      setError(null);
      
      // Close modal
      setCancelModal({ isOpen: false, orderId: null, orderName: '' });
    } catch (err) {
      console.error('Error cancelling order:', err);
      const message = err.message || 'Failed to cancel order. Please try again.';
      setError(message);
      showError(message);
    }
  };

  // Cancel modal close
  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, orderId: null, orderName: '' });
  };

  // ...existing animation state and useEffects...
  const [isVisible, setIsVisible] = useState({ hero: false, content: false, ordersList: false });
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true })); } }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const sections = document.querySelectorAll('[data-section]'); sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => { const timer = setTimeout(() => { setIsVisible(prev => ({ ...prev, hero: true })); }, 100); return () => clearTimeout(timer); }, []);


  // --- Render Logic ---
  return (
    <div className="min-h-screen relative font-sans bg-gray-50">
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
              Are you sure you want to cancel <span className="font-semibold text-gray-900">{cancelModal.orderId}</span>?
            </p>
            <p className="text-gray-500 text-center mb-6 text-xs">
              {cancelModal.orderName}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute w-full z-50"><DynamicNavigation /></div>

      {/* Hero Section */}
      <div className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}>
        <div className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="hero">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">My Orders</h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">Track and manage all your orders in one place</p>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button onClick={() => navigate('/menu')} className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg">Browse Menu +</button>
          </div>
        </div>
      </div>

      {/* Orders Content Section */}
      <div className="bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header, Search, Filter */}
          <div className="mb-8">
            <div className={`flex flex-col gap-6 mb-6 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="content">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Order History</h2>
                  <p className="text-gray-600 font-medium">
                    {loading ? 'Loading...' : `Order Items (${filteredOrders.length})`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" placeholder="Search for orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 bg-white" />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 bg-white appearance-none cursor-pointer min-w-[130px]">
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  {(searchTerm || filterStatus !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap">Clear all</button>
                  )}
                </div>
              </div>
              {(searchTerm || filterStatus !== 'all') && !loading && (
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== 'all' && ` with status "${filterStatus}"`}
                </div>
              )}
            </div>
          </div>

          {/* Orders List - Updated Design */}
          <div className={`space-y-4 transition-all duration-1000 ease-out ${isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="ordersList">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Loading your orders...</h3>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-red-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Error loading orders</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
                <button onClick={fetchOrders} className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors duration-300">Try Again</button>
              </div>
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <div key={order.orderId} className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-out ${isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${200 + (index * 100)}ms` }}>
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                        <img src={order.image} alt={order.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = bowlImage; e.target.className = "w-12 h-12 object-contain"; }} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-xl text-gray-900">{order.orderId}</h3>
                        <p className="text-gray-500 text-xs">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                      <p className="text-2xl font-bold text-gray-900">₱{order.price}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between items-center text-sm">
                          <div className="flex items-center min-w-0">
                            <img src={item.image} alt={item.name} className="w-6 h-6 rounded-sm object-cover mr-2" onError={(e) => { e.target.src = bowlImage; e.target.className = "w-6 h-6 object-contain p-0.5"; }} />
                            <span className="text-gray-700 truncate">{item.quantity}x {item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 flex-shrink-0 ml-2">₱{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Information:</h4>
                    <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Status: </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button onClick={() => handleViewOrder(order.orderId)} className="flex-1 sm:flex-none px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                      <button onClick={() => handleTrackOrder(order.orderId)} className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Track
                      </button>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button onClick={() => handleCancelOrder(order)} className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders found</h3>
                <p className="text-sm text-gray-600 mb-4">{searchTerm || filterStatus !== 'all' ? "No orders match your current filters." : "You haven't placed any orders yet."}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/menu')} className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors">Start Ordering</button>
                  {(searchTerm || filterStatus !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors">Clear Filters</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination - Show info bar even with single page, buttons only when multiple pages */}
          {filteredOrders.length > 0 && !loading && !error && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-4 border border-gray-200 gap-3">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                        return (
                          <button 
                            key={pageNumber} 
                            onClick={() => setCurrentPage(pageNumber)} 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber} className="px-1 py-1 text-xs text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
