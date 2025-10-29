import React, { useState, useEffect, useCallback } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import bowlImage from '../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 1. Import service functions and useToast
import { getOrdersByUserId, cancelOrder } from '../services/orderService'; // Adjust path if needed
import { useToast } from '../context/ToastContext';
import { jwtDecode } from 'jwt-decode'; // Keep jwtDecode for fallback userId

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Renamed isLoading
  const { showSuccess, showError } = useToast(); // Use toast

  // Redirect if not authenticated
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      showError("Please log in to view your orders.");
      navigate('/login');
    }
  }, [authIsLoading, isAuthenticated, navigate, showError]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Separate loading state for orders
  const [error, setError] = useState(null); // Use this for displaying errors

  // --- Data Fetching ---
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return; // Don't fetch if not logged in

    let currentUserId = user?.userId;

    // Fallback: Try decoding token if userId not yet in context (might happen on initial load)
    if (!currentUserId) {
      const token = localStorage.getItem('token'); // Use the correct key 'token'
      if (token) {
        try {
          const decoded = jwtDecode(token);
          currentUserId = decoded.userId || decoded.nameid; // Common claims for user ID
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
      // 2. Use the service function
      const fetchedOrders = await getOrdersByUserId(currentUserId);

      console.log('API Response:', fetchedOrders); // Check this log in your browser console!

      // 3. Map the DTO response
      const mappedOrders = fetchedOrders.map(order => {
        // FIX: Use the likely PascalCase name from the backend DTO
        const firstItemName = order.orderItems?.[0]?.itemName ?? 'Unknown Item'; // Changed ItemName to itemName
        const totalQuantity = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

        // Debug log inside map
        console.log(`Order ID ${order.orderId}, First Item Object:`, order.orderItems?.[0], `Resolved Name: ${firstItemName}`);

        return {
          id: order.orderId,
          orderId: order.orderId.toString(),
          name: order.orderItems?.length > 1
            ? `${firstItemName} + ${order.orderItems.length - 1} more`
            : firstItemName,
          description: `Order #${order.orderId} • ${new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          price: order.totalPrice?.toFixed(2) ?? '0.00',
          quantity: totalQuantity,
          image: bowlImage, // Keep default image for now
          status: getStatusString(order.status), // Use helper
          orderDate: new Date(order.orderDate).toISOString().split('T')[0],
          items: order.orderItems ?? [] // Ensure items is always an array
        };
      });

      console.log('Mapped orders:', mappedOrders);
      setOrders(mappedOrders);

    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMsg = `Failed to load orders: ${err.message}. Please try again.`;
      setError(errorMsg);
      showError(errorMsg); // Show toast for fetch error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId, showError, navigate]); // Dependencies for fetching

  // Fetch orders when authentication state is resolved and user ID is available
  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      fetchOrders();
    }
  }, [authIsLoading, isAuthenticated, fetchOrders]); // Trigger fetch

  // --- Helper Functions ---
  const getStatusString = (statusEnum) => { // Takes the numeric enum value
    switch (statusEnum) {
      case 1: return 'Pending';
      case 2: return 'Preparing';
      case 3: return 'Ready'; // Assuming Ready based on previous code
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };
  // ... (getStatusColor and getStatusIcon remain the same) ...
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-600';
      case 'Preparing': return 'bg-yellow-100 text-yellow-600';
      case 'Ready': return 'bg-orange-100 text-orange-600'; // Added 'Ready'
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  const getStatusIcon = (status) => { /* ... same icon logic ... */
    switch (status.toLowerCase()) { // Use lower case for comparison
      case 'delivered': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>;
      case 'preparing': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>;
      case 'pending': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>; // Changed pending icon
      case 'ready': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.71 8.71c-.39-.39-1.02-.39-1.41 0l-10.59 10.59-4.59-4.59c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l5.3 5.3c.39.39 1.02.39 1.41 0l11.3-11.3c.4-.39.4-1.02.01-1.41z" /></svg>; // Added ready icon
      default: return null;
    }
  };


  // --- Filtering and Pagination State & Logic ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // Filter by string status
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;

  const filteredOrders = orders.filter(order => {
    const lowerSearch = searchTerm.toLowerCase();
    // Search in order name (derived from items) or order ID
    const matchesSearch =
      order.name.toLowerCase().includes(lowerSearch) ||
      order.orderId.includes(searchTerm); // Allow searching by ID

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ... (Pagination logic remains the same) ...
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);


  // --- Action Handlers ---
  const handleViewOrder = (orderId) => {
    navigate(`/view-order/${orderId}`); // Navigate to a detail page
  };

  const handleTrackOrder = (orderId) => {
    // Placeholder - Navigate or show tracking info
    showSuccess(`Tracking for Order #${orderId} (feature coming soon!)`);
    // navigate(`/track-order/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    // Use confirm for simplicity, replace with modal in production
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        // 4. Use the service function
        const response = await cancelOrder(orderId); // Returns { message }

        // 5. Update state optimistically
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId.toString()
              ? { ...order, status: 'Cancelled' }
              : order
          )
        );
        showSuccess(response.message || `Order #${orderId} cancelled successfully.`);
        setError(null); // Clear previous errors on success

      } catch (err) {
        console.error('Error cancelling order:', err);
        // 6. Show error from service using toast
        const message = err.message || 'Failed to cancel order. Please try again.';
        setError(message); // Keep error state for potential display
        showError(message); // Show toast notification
        // Optional: setTimeout(() => setError(null), 5000); // Clear error message after a delay
      }
    }
  };

  // ... (Animation state and useEffects remain the same) ...
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
      {/* ... (Navigation and Hero section remain the same) ... */}
      <div className="absolute w-full z-50"> <DynamicNavigation /> </div>
      <div className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} >
        <div className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="hero" >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6"> View Orders </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed"> See all your past and current orders in one place </p>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button onClick={() => navigate('/menu')} className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg" > Browse Menu + </button>
          </div>
        </div>
      </div>


      {/* Orders Content Section */}
      <div className="bg-gray-50 pt-20 pb-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header, Search, Filter */}
          <div className="mb-8">
            <div className={`flex flex-col gap-6 mb-6 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="content" >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Order History</h2>
                  <p className="text-gray-600 text-sm font-medium">
                    {loading ? 'Loading...' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    {/* ... (Search input JSX) ... */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"> <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div>
                    <input type="text" placeholder="Search orders by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 bg-white text-sm" />
                    {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"> <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> </button>)}

                  </div>
                  {/* Filter */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 bg-white appearance-none cursor-pointer min-w-[130px] text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {/* ... (Dropdown arrow) ... */}
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"> <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> </div>
                  </div>
                  {/* Clear Button */}
                  {(searchTerm || filterStatus !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2 text-xs text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap bg-gray-100 hover:bg-gray-200 rounded-full" > Clear </button>
                  )}
                </div>
              </div>
              {/* Results Summary */}
              {(searchTerm || filterStatus !== 'all') && !loading && (
                <div className="text-xs text-gray-500 mt-1">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== 'all' && ` with status "${filterStatus}"`}
                </div>
              )}
            </div>
          </div>

          {/* Orders List / Loading / Error / No Orders */}
          <div
            className={`space-y-4 transition-all duration-1000 ease-out ${isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            data-section="ordersList" style={{ transitionDelay: '200ms' }}
          >
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"> {/* Loading state */}
                {/* ... (Spinner and text) ... */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"> <svg className="w-10 h-10 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> </div>
                <h3 className="text-lg font-semibold text-gray-700">Loading your orders...</h3>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-red-200"> {/* Error state */}
                {/* ... (Error icon, text, retry button) ... */}
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center"> <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Error loading orders</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
                <button onClick={fetchOrders} className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors duration-300" > Try Again </button>
              </div>
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <div
                  key={order.orderId}
                  className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ease-out`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Image Placeholder */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={bowlImage} alt="Order item" className="w-10 h-10 object-contain text-gray-400" />
                      </div>
                      {/* Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate" title={order.name}>{order.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}> {order.status} </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm truncate" title={order.description}>{order.description}</p>
                        <div className="flex items-center gap-3 text-xs sm:text-sm mt-1">
                          <p className="text-gray-700 font-medium">₱{order.price}</p>
                          <p className="text-gray-500">Qty: {order.quantity}</p>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                      {/* View Button */}
                      <button
                        onClick={() => handleViewOrder(order.orderId)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700 rounded-lg flex items-center justify-center transition-colors border border-gray-200 hover:border-yellow-300 text-xs sm:text-sm font-medium gap-1"
                        title="View Order Details"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span className="hidden sm:inline">View</span>
                      </button>
                      {/* Track Button */}
                      <button
                        onClick={() => handleTrackOrder(order.orderId)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg flex items-center justify-center transition-colors border border-gray-200 hover:border-blue-300 text-xs sm:text-sm font-medium gap-1"
                        title="Track Order"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="hidden sm:inline">Track</span>
                      </button>
                      {/* Cancel Button */}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg flex items-center justify-center transition-colors border border-gray-200 hover:border-red-300 text-xs sm:text-sm font-medium gap-1"
                          title="Cancel Order"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"> {/* No orders state */}
                {/* ... (Icon, text, buttons) ... */}
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"> <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders found</h3>
                <p className="text-sm text-gray-600 mb-4"> {searchTerm || filterStatus !== 'all' ? "No orders match your current filters." : "You haven't placed any orders yet."} </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/menu')} className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors" > Start Ordering </button>
                  {(searchTerm || filterStatus !== 'all') && (<button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-5 py-2 rounded-full font-semibold transition-colors" > Clear Filters </button>)}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && !error && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 gap-3">
              {/* ... (Pagination logic and buttons - simplified slightly) ... */}
              <div className="text-xs text-gray-600 font-medium"> Showing <span className="font-bold text-gray-800">{indexOfFirstOrder + 1}</span>-<span className="font-bold text-gray-800">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="font-bold text-gray-800">{filteredOrders.length}</span> </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-yellow-500 hover:text-white border border-gray-300 hover:border-yellow-500'}`} > Prev </button>
                <div className="flex space-x-0.5">
                  {[...Array(totalPages)].map((_, index) => { const pageNumber = index + 1; if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) { return (<button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${currentPage === pageNumber ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}`} > {pageNumber} </button>); } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) { return (<span key={pageNumber} className="px-1 py-1 text-xs text-gray-400">...</span>); } return null; })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-yellow-500 hover:text-white border border-gray-300 hover:border-yellow-500'}`} > Next </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

