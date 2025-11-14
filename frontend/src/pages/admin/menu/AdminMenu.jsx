import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getAllAdminMenuItems, getAllCategories, deleteMenuItem, updateMenuItem } from '../../../services/menuService';
import { API_BASE_URL } from '../../../apiConfig';

const AdminMenu = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: ''
  });

  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    item: null,
    action: '' // 'enable' or 'disable'
  });

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    menuItems: false
  });

  // --- Data Fetching ---
  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      showError('Failed to load categories.');
    }
  }, [showError]);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAdminMenuItems();
      const formattedData = data.map((item) => {
        const categoryObj = categories.find(cat => cat.categoryId === item.categoryId);
        const categoryName = categoryObj ? categoryObj.name : 'Unknown';

        return {
          id: item.itemId,
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          categoryId: item.categoryId,
          category: categoryName,
          image: item.imageUrl || null,
          isActive: item.isAvailable,
          createdDate: item.createdDate || new Date().toISOString(),
          updatedDate: item.updatedDate || new Date().toISOString(),
        };
      });

      setMenuItems(formattedData);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(`Failed to load menu items: ${err.message}`);
      showError(`Failed to load menu items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [categories, showError]);

  // Fetch categories first, then menu items
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchMenuItems();
    }
  }, [categories, fetchMenuItems]);

  // --- Filtering and Pagination ---
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.categoryId === parseInt(filterCategory);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // --- Animation ---
  useEffect(() => {
    if (loading) return;
    setIsVisible({ hero: true, content: true, menuItems: true });
  }, [loading]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case 'Main Course': return 'bg-blue-100 text-blue-600';
      case 'Dessert': return 'bg-pink-100 text-pink-600';
      case 'Beverages': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return bowlImage;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  // --- Action Handlers with Modals ---
  const handleView = (itemId) => {
    navigate(`/admin/menu/view/${itemId}`);
  };

  const handleEdit = (itemId) => {
    navigate(`/admin/menu/edit/${itemId}`);
  };

  const handleDelete = (item) => {
    setDeleteModal({
      isOpen: true,
      itemId: item.itemId,
      itemName: item.name
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteMenuItem(deleteModal.itemId);
      showSuccess(`"${deleteModal.itemName}" deleted successfully.`);
      fetchMenuItems();
      setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
    } catch (err) {
      console.error(`Error deleting item ${deleteModal.itemId}:`, err);
      showError(`Failed to delete item: ${err.message}`);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
  };

  const handleToggleStatus = (item) => {
    const action = item.isActive ? 'disable' : 'enable';
    setToggleModal({
      isOpen: true,
      item: item,
      action: action
    });
  };

  const confirmToggleStatus = async () => {
    const { item, action } = toggleModal;
    const updatedStatus = !item.isActive;

    try {
      const updateData = {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        categoryId: item.categoryId,
        isAvailable: updatedStatus
      };

      await updateMenuItem(item.itemId, updateData);
      showSuccess(`"${item.name}" has been ${action}d.`);
      fetchMenuItems();
      setToggleModal({ isOpen: false, item: null, action: '' });
    } catch (err) {
      console.error(`Error updating status for item ${item.itemId}:`, err);
      showError(`Failed to ${action} item: ${err.message}`);
    }
  };

  const cancelToggleStatus = () => {
    setToggleModal({ isOpen: false, item: null, action: '' });
  };

  // --- Render Logic ---
  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-700">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-red-700 mb-2">Loading Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={fetchMenuItems} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans bg-gray-50">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Menu Item?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.itemName}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {toggleModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-200">
            <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${toggleModal.action === 'enable' ? 'bg-green-100' : 'bg-orange-100'}`}>
              <svg className={`w-8 h-8 ${toggleModal.action === 'enable' ? 'text-green-500' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {toggleModal.action === 'enable' ? 'Enable' : 'Disable'} Menu Item?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Are you sure you want to {toggleModal.action} <span className="font-semibold text-gray-900">"{toggleModal.item?.name}"</span>?
              {toggleModal.action === 'disable' && ' This item will no longer be visible to customers.'}
              {toggleModal.action === 'enable' && ' This item will become available to customers.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelToggleStatus}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors ${
                  toggleModal.action === 'enable' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {toggleModal.action === 'enable' ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Menu Management
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Create, edit, and manage your restaurant's menu items
          </p>
        </div>
        {/* Create Button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={() => navigate('/admin/menu/create')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
            >
              {/* ... (SVG icon) ... */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Item
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Category: <span className="text-yellow-500">
                    {filterCategory === 'all'
                      ? 'All Categories'
                      : categories.find(c => c.categoryId === parseInt(filterCategory))?.name || 'Unknown'
                    }
                  </span>
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                  {filterStatus !== 'all' && ` (${filterStatus} only)`}
                </p>
              </div>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  {/* ... (Search input with icon) ... */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-300"
                  />
                </div>
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:border-gray-400"
                  >
                    <option value="all">All Categories</option>
                    {/* Use fetched categories */}
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {/* ... (Dropdown arrow icon) ... */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:border-gray-400"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  {/* ... (Dropdown arrow icon) ... */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          {currentItems.length > 0 ? (
            <div
              className={`transition-all duration-1000 ease-out ${isVisible.menuItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              data-section="menuItems"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {currentItems.map((item, index) => (
                  <div
                    key={item.itemId}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => { e.target.src = bowlImage; }}
                      />
                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-lg">
                        <span className="text-xs font-bold text-gray-800">#{item.itemId}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg ${item.isActive ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
                          {item.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg ${getCategoryColor(item.category)} border border-white/20`}>
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-grow p-5">
                      {/* ... (Title, Description) ... */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom Section */}
                      <div className="mt-auto space-y-4">
                        {/* ... (Price, Update Info) ... */}
                        <div className="flex items-center justify-between py-3 px-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-yellow-500">₱{item.price.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block mb-0.5">Updated</span>
                            <span className="text-xs text-gray-700 font-semibold">
                              {formatDate(item.updatedDate)}
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-gray-200"></div>
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button onClick={() => handleView(item.itemId)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View
                          </button>
                          <button onClick={() => handleEdit(item.itemId)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Edit
                          </button>
                          <button onClick={() => handleToggleStatus(item)} className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${item.isActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg> {item.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => handleDelete(item)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // No items found message
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              {/* ... (SVG icon) ... */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items found</h3>
              <p className="text-gray-700 mb-6 font-medium">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? "No items match your current search criteria."
                  : "You haven't created any menu items yet."
                }
              </p>
              {/* ... (Buttons for create/clear filters) ... */}
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/admin/menu/create')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  Create First Item
                </button>
                {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setFilterStatus('all');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              {/* ... (Pagination logic and buttons) ... */}
              <div className="text-sm text-gray-800 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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

export default AdminMenu;

