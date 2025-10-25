import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicNavigation from '../components/dynamicNavbar';
import bowlImage from '../assets/BOWL.png';
import bgImage from '../assets/MAIN4.png';
import logoImage from '../assets/LOGO1.png';
import axios from 'axios'
import { useToast } from '../context/ToastContext';

const Menu = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 items per page
  const [isVisible, setIsVisible] = useState({
    hero: false,
    categories: false,
    menuSection: false,
    callToAction: false
  });

  // Categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [catRes, itemsRes] = await Promise.all([
          axios.get('http://localhost:5143/api/menu/categories'),
          axios.get('http://localhost:5143/api/menu')
        ]);

        console.log('Categories API Response:', catRes.data);
        console.log('Menu Items API Response:', itemsRes.data);

        const allItemsCategory = { categoryId: 0, name: 'All Items' };
        const categoriesData = [allItemsCategory, ...catRes.data];

        setCategories(categoriesData);
        
        // Format items with proper image URL handling and price - FIXED
        const formattedItems = itemsRes.data.map(item => {
          // Use the same image URL logic as AdminMenu
          let imageUrl = item.imageUrl || '';
          
          return {
            ...item,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            imageUrl: imageUrl // Keep the original path from backend
          };
        });
        
        setMenuItems(formattedItems);

        console.log('Formatted items:', formattedItems.map(item => ({ 
          name: item.name, 
          categoryId: item.categoryId, 
          imageUrl: item.imageUrl,
          price: item.price 
        })));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu data. Please refresh the page.');
        showError('Failed to load menu data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [showError])

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
    setIsVisible(prev => ({ ...prev, hero: true }));
  }, []);

  // Update Cart Count from localStorage Dynamically
  const [cartCount, setCartCount] = useState(0);

  // Load cart count on mount and whenever localStorage updates
  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(storedCart.reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("focus", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("focus", updateCartCount);
    };
  }, []);

  // FIXED: Filter menu items based on category and search
  const filteredItems = menuItems.filter(item => {
    // First apply search filter
    const matchesSearch = !searchTerm.trim() || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // If "All Items" is chosen, show all items that match search
    if (selectedCategory === 'All Items') {
      return matchesSearch;
    }

    // Find the selected category from categories array
    const selectedCat = categories.find(cat => cat.name === selectedCategory);

    if (!selectedCat) {
      console.log('Selected category not found:', selectedCategory);
      return false;
    }

    // Check if item's categoryId matches the selected category's id or categoryId
    const matchesCategory =
      item.categoryId === selectedCat.id ||
      item.categoryId === selectedCat.categoryId;

    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Remove this section - Don't scroll on category or search change
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [selectedCategory]);

  // Debug: Log filtered items whenever dependencies change
  useEffect(() => {
    console.log('Current search term:', searchTerm);
    console.log('Selected category:', selectedCategory);
    console.log('Total menu items:', menuItems.length);
    console.log('Filtered Items:', filteredItems.length, filteredItems.map(item => ({ name: item.name, categoryId: item.categoryId })));
  }, [filteredItems, searchTerm, selectedCategory, menuItems.length]);

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Navigation */}
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Hero Section with Background Image - Title Only */}
      <div
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
        data-section="hero"
      >
        <div className={`text-center max-w-4xl transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Select a Category
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed px-4 max-w-3xl mx-auto">
            Choose from our different food categories and find the perfect Filipino dish to satisfy your cravings
          </p>
        </div>
      </div>

      {/* Category Selection Section - Fixed in place */}
      <div className="relative -mt-16 mb-16 px-4 sm:px-6 lg:px-8 z-30">
        <div
          className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible.categories ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          data-section="categories"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const getIcon = (categoryName) => {
                switch (categoryName) {
                  case 'All Items':
                  case 'Appetizer':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    );
                  case 'Main Course':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12.88 11.53z" />
                      </svg>
                    );
                  case 'Dessert':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    );
                  case 'Beverages':
                    return (
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
                      </svg>
                    );
                  default:
                    return category.icon;
                }
              };

              return (
                <button
                  key={category.id || `custom-${category.name}`}
                  onClick={() => {
                    console.log('Selected category:', category.name);
                    setSelectedCategory(category.name);
                  }}
                  className={`bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 transition-all duration-300 ${selectedCategory === category.name
                    ? 'ring-2 ring-yellow-400/50 shadow-lg transform scale-105'
                    : 'hover:bg-gray-50 hover:shadow-lg hover:scale-105'
                    }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      {getIcon(category.name)}
                    </div>
                    <h3 className="text-yellow-400 font-bold text-lg sm:text-xl">
                      {category.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div
        className={`bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible.menuSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        data-section="menuSection"
      >
        <div className="max-w-6xl mx-auto">
          <div className={`flex flex-col lg:flex-row justify-between items-center mb-12 sm:mb-16 gap-6 transition-all duration-1000 ${isVisible.menuSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '200ms' }}>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Category: <span className="text-yellow-500">{selectedCategory}</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full lg:w-80 pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-300"
              />
            </div>
          </div>

          {/* Menu Items Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-20 bg-gray-300 rounded-full"></div>
                      <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Menu</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
              >
                Refresh Page
              </button>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {currentItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full ${isVisible.menuSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  style={{
                    transitionDelay: `${400 + (index * 100)}ms`
                  }}
                >
                  {/* Item Image - Fixed aspect ratio matching AdminMenu */}
                  <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl ? `http://localhost:5143/${item.imageUrl}` : bowlImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        console.log('Image load error for:', item.name, 'URL:', e.target.src);
                        e.target.src = bowlImage;
                        // Keep object-cover even on fallback
                      }}
                    />
                    {/* Gradient overlay for better aesthetics */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Item Details */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    {/* Title with line clamp */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors duration-300 line-clamp-1 min-h-[1.75rem]">
                      {item.name || 'Loading...'}
                    </h3>
                    
                    {/* Description with proper line clamp and fixed height */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-2 min-h-[2.5rem]">
                      {item.description || 'Loading description...'}
                    </p>

                    {/* Price and Add Button - Fixed at bottom */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                      <span className="bg-yellow-100 text-yellow-500 px-4 py-2 rounded-full font-bold text-lg">
                        ₱{(item.price || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          if (!item.price || item.price === 0) {
                            showError('Price information not available. Please try again.');
                            return;
                          }
                          
                          const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                          const itemExists = existingCart.find(i => i.itemId === item.itemId);

                          // Store the full image URL in cart
                          const imageForCart = item.imageUrl ? `http://localhost:5143/${item.imageUrl}` : bowlImage;

                          let updatedCart;
                          if (itemExists) {
                            updatedCart = existingCart.map(i =>
                              i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i
                            );
                            showSuccess(`${item.name} quantity updated! Total: ${itemExists.quantity + 1}`);
                          } else {
                            updatedCart = [...existingCart, {
                              ...item,
                              quantity: 1,
                              image: imageForCart // Use the full URL
                            }];
                            showSuccess(`${item.name} added to cart! Ready to order.`);
                          }

                          localStorage.setItem("cart", JSON.stringify(updatedCart));
                          window.dispatchEvent(new Event("cartUpdated"));
                          setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
                        }}
                        disabled={!item.price || item.price === 0}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 group/button"
                      >
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover/button:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="hidden sm:inline">Add Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Items Found */
            <div className={`text-center py-16 transition-all duration-1000 ${isVisible.menuSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: '600ms' }}>
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Items');
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && !error && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 gap-4">
              <div className="text-sm text-gray-700 font-medium">
                Showing <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredItems.length)}</span> of{' '}
                <span className="font-bold text-gray-900">{filteredItems.length}</span> items
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    // Remove scroll - window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-yellow-500 hover:text-white border border-gray-300 hover:border-yellow-500'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => {
                            setCurrentPage(pageNumber);
                            // Remove scroll - window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                            currentPage === pageNumber
                              ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    // Remove scroll - window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-yellow-500 hover:text-white border border-gray-300 hover:border-yellow-500'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      <div
        className={`bg-gray-100 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible.callToAction ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        data-section="callToAction"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
            Ready to <span className="text-yellow-500">Order?</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto">
            Found something delicious? Add your favorite items to your cart and enjoy authentic Filipino flavors delivered fresh to you.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ${isVisible.callToAction ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '300ms' }}>
            <button
              onClick={() => navigate('/cart')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m0 0L12 18m0 0l2.5-2.5M12 18l-2.5-2.5" />
              </svg>
              View Cart ({cartCount})
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-yellow-500 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {/* Logo and Description */}
            <div className="md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-6">
                <img 
                  src={logoImage} 
                  alt="Lamoy Logo"
                  className="w-20 h-20 sm:w-40 sm:h-40 mr-2 sm:mr-3"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><button onClick={() => navigate('/home')} className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Home</button></li>
                <li><button onClick={() => navigate('/menu')} className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Menu</button></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">About</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Contact</a></li>
              </ul>
            </div>

            {/* Our Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Our Links</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Terms</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Privacy</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Support</a></li>
                <li><a href="#" className="text-white/80 hover:text-white transition-colors duration-200 text-sm sm:text-base">Delivery</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li className="text-white/80 text-sm sm:text-base">lamoy@example.com</li>
                <li className="text-white/80 text-sm sm:text-base">+63 123 456 7890</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-white/80 text-sm sm:text-base">© 2025 Lamoy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Menu;