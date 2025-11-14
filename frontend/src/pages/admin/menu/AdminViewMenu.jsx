import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useAuth } from '../../../context/AuthContext';
// 1. Import services, helpers, and toast
import { getMenuItemById, getAllCategories, deleteMenuItem } from '../../../services/menuService';
import { useToast } from '../../../context/ToastContext';
import { API_BASE_URL } from '../../../apiConfig';

const AdminViewMenu = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // 2. Add loading and error states
  const [menuItem, setMenuItem] = useState(null);
  const [categories, setCategories] = useState([]); // To map category ID to name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // For delete button

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    details: false
  });

  // 3. Helper to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return bowlImage; // Default image
    // Use the same logic as AdminMenu
    return `${API_BASE_URL.replace('/api', '')}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  // 4. Real data fetching
  const fetchItemDetails = useCallback(async () => {
    if (!isAuthenticated || !itemId || isNaN(parseInt(itemId))) {
      return;
    }
    console.log("Fetching details for:", itemId);
    setLoading(true);
    setError(null);
    try {
      // Fetch item and categories at the same time
      const [itemDto, fetchedCategories] = await Promise.all([
        getMenuItemById(itemId),
        getAllCategories()
      ]);

      console.log("Fetched Item DTO:", itemDto);
      console.log("Fetched Categories:", fetchedCategories);

      // Find the category name
      const categoryObj = fetchedCategories.find(c => c.categoryId === itemDto.categoryId);

      // Set the final menu item object for display
      setMenuItem({
        id: itemDto.itemId,
        itemId: itemDto.itemId,
        name: itemDto.name,
        description: itemDto.description,
        price: itemDto.price,
        category: categoryObj ? categoryObj.name : 'Unknown Category',
        image: getImageUrl(itemDto.imageUrl), // Use helper
        isActive: itemDto.isAvailable,
        // Add any other DTO fields you want to display
      });
      setCategories(fetchedCategories);

    } catch (err) {
      console.error('Error fetching menu item:', err);
      setError(`Failed to load item: ${err.message}`);
      showError(`Failed to load item: ${err.message}`);
      navigate('/admin/menu');
    } finally {
      setLoading(false);
    }
  }, [itemId, isAuthenticated, navigate, showError]);

  // 5. Auth and Fetch useEffect
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (!authIsLoading && isAuthenticated) {
      fetchItemDetails();
    }
  }, [authIsLoading, isAuthenticated, fetchItemDetails, navigate]);


  // Intersection Observer for scroll animations
  useEffect(() => {
    // Don't run observer until data is loaded
    if (loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        });
      }, { threshold: 0.1 }
    );
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    // Set hero visible immediately
    setIsVisible(prev => ({
      ...prev,
      hero: true,
      content: true,
      details: true
    }));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [loading, error]); // Rerun when loading finishes


  // 6. Helper functions (updated)
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
      case 'Main Course': return 'bg-blue-100 text-blue-600';
      case 'Dessert': return 'bg-pink-100 text-pink-600';
      case 'Beverages': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // 7. Delete Handler
  const handleDelete = async () => {
    if (!menuItem) return;
    if (window.confirm(`Are you sure you want to permanently delete "${menuItem.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteMenuItem(menuItem.itemId);
        showSuccess(`Item "${menuItem.name}" deleted successfully.`);
        navigate('/admin/menu', { replace: true });
      } catch (err) {
        console.error('Error deleting item:', err);
        showError(`Delete failed: ${err.message}`);
        setIsDeleting(false);
      }
    }
  };


  // 8. Loading and Error States
  if (loading || authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg font-medium text-gray-700">Loading Menu Item...</span>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50"><AdminNavigation /></div>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error || "The item you're looking for doesn't exist."}</p>
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

  // --- Main Render ---
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
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Menu Item Details
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Viewing details for "{menuItem.name}"
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
      <div className="bg-gray-50 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <button onClick={() => navigate('/admin/menu')} className="hover:text-yellow-600 font-medium">Menu</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">View Item #{menuItem.itemId}</span>
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
            {/* Left Column - Image and Price */}
            <div
              className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              data-section="details"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Item Preview</h3>

              {/* Image */}
              <div className="relative h-80 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden mb-8">
                <img
                  src={menuItem.image}
                  alt={menuItem.name}
                  className="w-full h-full object-cover" // Use object-cover for better fit
                  onError={(e) => {
                    e.target.src = bowlImage;
                    e.target.className = "w-64 h-64 object-contain"; // Fallback style
                  }}
                />
              </div>

              {/* Price Stat */}
              <div className="grid grid-cols-1 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-gray-900 mb-1">₱{menuItem.price.toFixed(2)}</div>
                  <div className="text-gray-600 font-medium">Price</div>
                </div>
                {/* Removed mock stats (orders, rating, reviews) */}
              </div>
            </div>

            {/* Right Column - Details and Actions */}
            <div className="space-y-8">
              {/* Description */}
              <div
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '200ms' }}
                data-section="details" // Use the same data-section to trigger animation
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Description</h3>
                <p className="text-gray-700 leading-relaxed text-base">{menuItem.description}</p>
              </div>

              {/* Action Buttons */}
              <div
                className={`bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${isVisible.details ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '400ms' }}
                data-section="details"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions</h3>
                <div className="space-y-4">
                  {/* Edit Button */}
                  <button
                    onClick={() => navigate(`/admin/menu/edit/${menuItem.id}`)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Item Details
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-3 text-base border border-red-200 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Item
                      </>
                    )}
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
