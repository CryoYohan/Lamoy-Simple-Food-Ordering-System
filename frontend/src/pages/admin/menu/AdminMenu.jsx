import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useAuth } from '../../../context/AuthContext';

const AdminMenu = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Static menu data (in real app, this would come from API)
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      itemId: 'ITEM-001',
      name: 'Chicken Adobo',
      description: 'Traditional Filipino dish with tender chicken braised in soy sauce, vinegar, and garlic. Served with steamed rice.',
      price: 150.00,
      category: 'Main Course',
      image: bowlImage,
      isActive: true,
      createdDate: '2024-01-15T10:30:00Z',
      updatedDate: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      itemId: 'ITEM-002',
      name: 'Pancit Canton',
      description: 'Stir-fried noodles with vegetables, meat, and savory sauce. A Filipino favorite.',
      price: 120.00,
      category: 'Main Course',
      image: bowlImage,
      isActive: true,
      createdDate: '2024-01-16T09:15:00Z',
      updatedDate: '2024-01-16T09:15:00Z'
    },
    {
      id: 3,
      itemId: 'ITEM-003',
      name: 'Halo-Halo',
      description: 'Traditional Filipino dessert with mixed ingredients, shaved ice, and ube ice cream.',
      price: 90.00,
      category: 'Dessert',
      image: bowlImage,
      isActive: true,
      createdDate: '2024-01-17T14:20:00Z',
      updatedDate: '2024-01-17T14:20:00Z'
    },
    {
      id: 4,
      itemId: 'ITEM-004',
      name: 'Fresh Buko Juice',
      description: 'Refreshing coconut water served cold with coconut meat.',
      price: 65.00,
      category: 'Beverages',
      image: bowlImage,
      isActive: false,
      createdDate: '2024-01-18T11:45:00Z',
      updatedDate: '2024-01-18T11:45:00Z'
    },
    {
      id: 5,
      itemId: 'ITEM-005',
      name: 'Bicol Express',
      description: 'Spicy pork dish cooked in coconut milk with chilies and shrimp paste.',
      price: 180.00,
      category: 'Main Course',
      image: bowlImage,
      isActive: true,
      createdDate: '2024-01-19T16:30:00Z',
      updatedDate: '2024-01-19T16:30:00Z'
    },
    {
      id: 6,
      itemId: 'ITEM-006',
      name: 'Leche Flan',
      description: 'Silky smooth caramel custard dessert, a Filipino classic.',
      price: 85.00,
      category: 'Dessert',
      image: bowlImage,
      isActive: true,
      createdDate: '2024-01-20T13:10:00Z',
      updatedDate: '2024-01-20T13:10:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    menuItems: false
  });

  // Categories
  const categories = ['Main Course', 'Dessert', 'Beverages'];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchTerm.trim() || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Main Course':
        return 'bg-blue-100 text-blue-600';
      case 'Dessert':
        return 'bg-pink-100 text-pink-600';
      case 'Beverages':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleView = (itemId) => {
    navigate(`/admin/menu/view/${itemId}`);
  };

  const handleEdit = (itemId) => {
    navigate(`/admin/menu/edit/${itemId}`);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      console.log(`Menu item ${itemId} deleted`);
    }
  };

  const handleToggleStatus = (itemId) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, isActive: !item.isActive, updatedDate: new Date().toISOString() }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen relative font-sans bg-gray-50">
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
            Menu Management
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Create, edit, and manage your restaurant's menu items
          </p>
        </div>

        {/* Create New Item button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate('/admin/menu/create')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
            >
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

          {/* Filter Section - Redesigned with inline filters */}
          <div className="mb-8">
            <div className="">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Category: <span className="text-yellow-500">{filterCategory === 'all' ? 'All Categories' : filterCategory}</span>
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
                    {filterStatus !== 'all' && ` (${filterStatus} only)`}
                  </p>
                </div>
                
                {/* Search Bar and Filters - All in one row */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative">
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
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom row - now empty, can be removed if no other content needed */}
              <div className="flex justify-end">
                {/* Removed bulk actions section */}
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          {currentItems.length > 0 ? (
            <div 
              className={`transition-all duration-1000 ease-out ${
                isVisible.menuItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              data-section="menuItems"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {currentItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-105"
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Item Image with Overlaid Labels */}
                    <div className="relative h-48 bg-yellow-500 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-contain transition-transform duration-300 hover:scale-110"
                      />
                      
                      {/* Item ID - Top Left */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-900">#{item.itemId}</span>
                      </div>
                      
                      {/* Status Label - Top Right */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    

                    {/* Item Details */}

                    
                    <div className="p-6">

                      {/* Category Label */}
                      <div className="mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{item.name}</h3>
                      </div>
                      
                      
                      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-yellow-100 text-yellow-400 px-4 py-1.5 rounded-full font-bold text-md">
                          ₱{item.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-700 font-medium">
                          Updated {formatDate(item.updatedDate)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleView(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                            item.isActive 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                          {item.isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
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
              <div className="text-sm text-gray-800 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
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
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNumber
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
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