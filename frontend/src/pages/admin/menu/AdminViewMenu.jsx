import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavigation from '../../../components/admin/adminNavbar';
import { useAuth } from '../../../context/AuthContext';
import bgImage from '../../../assets/MAIN4.png'; 
import bowlImage from '../../../assets/BOWL.png';

const AdminViewMenu = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [menuItem, setMenuItem] = useState(null);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    details: false
  });

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        // Mock menu item data
        const mockItem = {
          id: itemId,
          itemId: `ITEM-${itemId}`,
          name: 'Chicken Adobo',
          description: 'The Philippines\' national dish! Tender chicken braised in soy sauce, vinegar, and garlic. Served with steamed rice. A perfect balance of salty, sour, and savory flavors that will transport you to the heart of Filipino cuisine.',
          price: 150.00,
          category: 'Main Course',
          image: bowlImage,
          isActive: true,
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          createdBy: 'Admin User',
          totalOrders: 45,
          rating: 4.8,
          reviews: 12
        };

        setMenuItem(mockItem);
      } catch (error) {
        console.error('Error fetching menu item:', error);
      }
    };

    fetchMenuItem();
  }, [itemId]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            setIsVisible(prev => ({
              ...prev,
              [section]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  // Set hero section visible immediately on mount
  useEffect(() => {
    setIsVisible(prev => ({ 
      ...prev, 
      hero: true, 
      content: true, 
      details: true 
    }));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
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

  if (!menuItem) {
    return (
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50">
          <AdminNavigation />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Item Not Found</h2>
            <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/admin/menu')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Menu Item Details
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            View complete information about this menu item
          </p>
        </div>

        {/* Back to Menu button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button 
              onClick={() => navigate('/admin/menu')}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Menu
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
              <button onClick={() => navigate('/admin/menu')} className="hover:text-yellow-600 font-medium">Menu</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">View Item</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(menuItem.isActive)}`}>
                {getStatusLabel(menuItem.isActive)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(menuItem.category)}`}>
                {menuItem.category}
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{menuItem.name}</h2>
            <p className="text-gray-600 text-lg">#{menuItem.itemId}</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div 
              className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              data-section="details"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Item Preview</h3>
              
              {/* Image */}
              <div className="relative h-80 bg-yellow-500 rounded-2xl flex items-center justify-center overflow-hidden mb-8">
                <img 
                  src={menuItem.image} 
                  alt={menuItem.name}
                  className="w-64 h-64 object-contain transition-transform duration-300 hover:scale-110"
                />
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-gray-900 mb-1">₱{menuItem.price.toFixed(2)}</div>
                  <div className="text-gray-600 font-medium">Price</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{menuItem.totalOrders}</div>
                  <div className="text-gray-600 font-medium">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">{menuItem.rating}</span>
                    <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="text-gray-600 font-medium">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{menuItem.reviews}</div>
                  <div className="text-gray-600 font-medium">Reviews</div>
                </div>
              </div>
            </div>

            {/* Right Column - Details and Actions */}
            <div className="space-y-8">
              {/* Description */}
              <div 
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                  isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{menuItem.description}</p>
              </div>

              {/* Item Information */}
              <div 
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                  isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Item Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Created By:</span>
                    <span className="font-semibold text-gray-900">{menuItem.createdBy}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Created On:</span>
                    <span className="font-semibold text-gray-900">{formatDate(menuItem.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Last Updated:</span>
                    <span className="font-semibold text-gray-900">{formatDate(menuItem.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${
                  isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate(`/admin/menu/edit/${menuItem.id}`)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Item Details
                  </button>
                  
                  <button
                    onClick={() => navigate('/admin/menu')}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Menu List
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

export default AdminViewMenu;