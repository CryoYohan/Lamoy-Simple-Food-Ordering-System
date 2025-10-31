import React, { useState, useEffect, useCallback } from 'react';
// FIX 1: Correct import paths
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// 2. Import services and helpers
import { getAllAdminOrders, updateOrderStatus } from '../../../services/orderService';
import { useToast } from '../../../context/ToastContext';
import { API_BASE_URL } from '../../../apiConfig';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // 3. Updated state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // Tracks which order is being updated

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // Filter by number (as string)
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(4);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    ordersList: false
  });

  // 4. --- Helper Functions (Maps backend numbers to display text) ---
  // We will use the backend's 1-5 enum as the source of truth
  const getStatusText = (statusEnum) => {
    switch (statusEnum) {
      case 1: return 'Pending';
      case 2: return 'Preparing';
      case 3: return 'Ready';
      case 4: return 'Delivered';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (statusEnum) => {
    switch (statusEnum) {
      case 1: return 'bg-gray-100 text-gray-600';    // Pending
      case 2: return 'bg-yellow-100 text-yellow-600'; // Preparing
      case 3: return 'bg-blue-100 text-blue-600';    // Ready
      case 4: return 'bg-green-100 text-green-600';  // Delivered
      case 5: return 'bg-red-100 text-red-600';      // Cancelled
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return bowlImage;
    return `${API_BASE_URL.replace('/api', '')}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return 'Invalid Date'; }
  };

  // 5. --- Data Fetching ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getAllAdminOrders();
      console.log("Fetched Admin Orders:", fetchedOrders);
      // Map fetched DTOs to the state structure
      const mappedData = fetchedOrders.map(order => ({
        id: order.orderId,
        orderId: `ORD-${order.orderId}`,
        customerName: order.userName, // Use userName from DTO
        customerEmail: order.user?.email || 'N/A', // Safely access email
        items: order.orderItems.map(item => ({
          name: item.itemName,
          quantity: item.quantity,
          price: item.priceAtPurchase,
          image: getImageUrl(item.imageUrl) // Use helper
        })),
        totalAmount: order.totalPrice,
        status: order.status, // Store the numeric status (1-5)
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: '' // This info isn't in your DTO
      }));
      setOrders(mappedData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError(`Failed to load orders: ${err.message}`);
      showError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [showError]); // Removed helpers from dependencies as they are stable

  // Auth check and initial fetch
  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated) {
        showError("Please log in as an admin.");
        navigate('/login', { replace: true });
        return;
      }
      const userRole = localStorage.getItem('role');
      if (userRole !== '1') { // Assuming '1' is Admin role
        showError("You are not authorized to view this page.");
        navigate('/admin', { replace: true });
        return;
      }
      fetchOrders();
    }
  }, [authIsLoading, isAuthenticated, navigate, showError, fetchOrders]);

  // ... (Animation useEffects remain the same) ...
  useEffect(() => {
    if (loading || error) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true }));
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));
    const timer = setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [loading, error]);


  // 6. --- Filtering (Updated) ---
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Compare numeric status
    const matchesStatus = filterStatus === 'all' || order.status === parseInt(filterStatus);
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

  // 7. --- Action Handlers (Updated) ---
  const handleStatusUpdate = async (orderId, newStatusInt) => {
    if (isNaN(newStatusInt)) return;

    setUpdatingId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, { status: newStatusInt });

      // Update local state with the new status
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === orderId
            ? { ...o, status: updatedOrder.status } // Use the exact status from response
            : o
        )
      );
      showSuccess(`Order #${orderId} updated to ${getStatusText(updatedOrder.status)}.`);
    } catch (err) {
      console.error('Error updating status:', err);
      showError(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Map your old handlers to the new one
  const handleAcceptOrder = (orderId) => handleStatusUpdate(orderId, 2); // 1:Pending -> 2:Preparing
  const handleStartPreparing = (orderId) => handleStatusUpdate(orderId, 3); // 2:Preparing -> 3:Ready
  const handleMarkReady = (orderId) => handleStatusUpdate(orderId, 4); // 3:Ready -> 4:Delivered

  const handleViewDetails = (orderId) => {
    navigate(`/admin/orders/view/${orderId}`);
  };

  // 8. --- Render Logic (Updated) ---
  if (authIsLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* ... Loading Spinner ... */}
        <svg className="animate-spin h-10 w-10 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg font-medium text-gray-700">Loading Orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        {/* ... Error Display ... */}
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="text-xl font-semibold text-red-700 mb-2">Loading Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={fetchOrders} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">Retry Loading</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans bg-gray-50"> {/* Added bg-gray-50 */}
      <div className="absolute w-full z-50">
        <AdminNavigation />
      </div>

      {/* Hero Section */}
      {/* ... (Hero JSX remains the same) ... */}
      <div className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }} >
        <div className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="hero" >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6"> Manage Orders </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed"> Review, accept, and manage all customer orders from one central location </p>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30"> <div className="bg-white/20 backdrop-blur-sm rounded-full p-3"> <button onClick={() => navigate('/admin/dashboard')} className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg" > Dashboard + </button> </div> </div>
      </div>

      {/* Orders Content Section */}
      <div className="bg-gray-50 pt-20 pb-12"> {/* Added pb-12 */}
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className={`flex flex-col gap-6 mb-6 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="content" >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Management</h2>
                  <p className="text-gray-600 font-medium">Order Items ({filteredOrders.length})</p>
                </div>
                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  {/* ... (Search Bar) ... */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"> <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> </div>
                    <input type="text" placeholder="Search for orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 bg-white" />
                    {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"> <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> </button>)}
                  </div>

                  {/* Filter Dropdown (Updated to use numeric values) */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 bg-white appearance-none cursor-pointer min-w-[120px]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="1">Pending</option>
                      <option value="2">Preparing</option>
                      <option value="3">Ready</option>
                      <option value="4">Delivered</option>
                      <option value="5">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"> <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> </div>
                  </div>
                  {/* ... (Clear filters button) ... */}
                  {(searchTerm || filterStatus !== 'all') && (<button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium whitespace-nowrap" > Clear all </button>)}
                </div>
              </div>
              {/* Results Summary */}
              {(searchTerm || filterStatus !== 'all') && !loading && (
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== 'all' && ` with status "${getStatusText(parseInt(filterStatus))}"`}
                </div>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className={`space-y-4 transition-all duration-1000 ease-out ${isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="ordersList" >
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => {
                return (
                  <div key={order.id} className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-out ${isVisible.ordersList ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${200 + (index * 100)}ms` }} >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src={order.items[0].image} alt={order.items[0].name} className="w-full h-full object-cover" onError={(e) => { e.target.src = bowlImage; e.target.className = "w-12 h-12 object-contain"; }} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-xl text-gray-900">{order.orderId}</h3>
                          <p className="text-gray-600 font-medium text-sm">{order.customerName}</p>
                          <p className="text-gray-500 text-xs">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                        <p className="text-2xl font-bold text-gray-900">₱{order.totalAmount.toFixed(2)}</p>
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
                      <p className="text-sm text-gray-700 mb-1">{order.deliveryAddress}</p>
                      {order.specialInstructions && (
                        <p className="text-sm text-gray-600 italic">Special Instructions: {order.specialInstructions}</p>
                      )}
                    </div>

                    {/* Quick Status Change Section (Button logic) */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600 font-medium">Current Status: </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      {/* --- RENDER ACTION BUTTON --- */}
                      <div className="space-y-2">
                        {/* Use numeric status for logic, string for display */}
                        {order.status === 1 && ( // Pending
                          <button onClick={() => handleStatusUpdate(order.id, 2)} disabled={updatingId === order.id} className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-50">
                            {updatingId === order.id ? '...' : 'Advance to Preparing →'}
                          </button>
                        )}
                        {order.status === 2 && ( // Preparing
                          <button onClick={() => handleStatusUpdate(order.id, 3)} disabled={updatingId === order.id} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-50">
                            {updatingId === order.id ? '...' : 'Advance to Ready →'}
                          </button>
                        )}
                        {order.status === 3 && ( // Ready
                          <button onClick={() => handleStatusUpdate(order.id, 4)} disabled={updatingId === order.id} className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center disabled:opacity-50">
                            {updatingId === order.id ? '...' : 'Mark as Delivered →'}
                          </button>
                        )}
                        {/* Completed or Cancelled State */}
                        {(order.status === 4 || order.status === 5) && (
                          <div className="w-full text-center py-1">
                            <span className={`text-sm font-semibold px-4 py-2 rounded-lg ${getStatusColor(order.status)} border ${order.status === 4 ? 'border-green-200' : 'border-red-200'} inline-flex items-center`}>
                              {order.status === 4 ? '✓ Order Delivered' : '✗ Order Cancelled'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end border-t border-gray-100 pt-4">
                      <button
                        onClick={() => handleViewDetails(order.id)} // Use 'id' from mapped state
                        className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              /* No Orders Found */
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                {/* ... (Icon, text, buttons) ... */}
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"> <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6"> {searchTerm || filterStatus !== 'all' ? "No orders match your current search criteria." : "No orders have been placed yet."} </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate('/admin/dashboard')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300" > Go to Dashboard </button>
                  {(searchTerm || filterStatus !== 'all') && (<button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-30m0" > Clear Filters </button>)}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              {/* ... (Pagination logic) ... */}
              <div className="text-sm text-gray-700"> Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} > Previous </button>
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => { const pageNumber = index + 1; if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) { return (<button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} > {pageNumber} </button>); } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) { return (<span key={pageNumber} className="px-1 py-1 text-xs text-gray-400">...</span>); } return null; })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} > Next </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
