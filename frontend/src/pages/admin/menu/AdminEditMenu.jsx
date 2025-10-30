import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavigation from '../../../components/admin/adminNavbar';
import bgImage from '../../../assets/MAIN4.png';
import bowlImage from '../../../assets/BOWL.png';
import { useAuth } from '../../../context/AuthContext';
// 1. Import services, helpers, and toast
import { getMenuItemById, updateMenuItem, deleteMenuItem, getAllCategories } from '../../../services/menuService'; // Assuming path
import { useToast } from '../../../context/ToastContext'; // Import useToast
import { API_BASE_URL } from '../../../apiConfig'; // Import API_BASE_URL

const AdminEditMenu = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Renamed auth loading
  const { showSuccess, showError } = useToast(); // Get toast functions

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '', // Use categoryId
    imageUrl: '',   // Store current image URL
    isAvailable: true // Use isAvailable
  });

  const [categories, setCategories] = useState([]); // State for fetched categories
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Page loading state (for fetching)
  const [isSubmitting, setIsSubmitting] = useState(false); // Button submitting state
  const [imagePreview, setImagePreview] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  // Error state for fetch/submit errors
  const [error, setError] = useState(null); // <-- DEFINES THE 'error' VARIABLE

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    form: false
  });

  // --- Fetch Initial Data (Replaces Mock Data) ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !itemId || isNaN(parseInt(itemId))) {
      if (isAuthenticated && itemId && isNaN(parseInt(itemId))) {
        showError("Invalid Menu Item ID.");
        navigate('/admin/menu', { replace: true });
      }
      return;
    }
    console.log("Fetching data for Item ID:", itemId);
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const [itemDto, fetchedCategories] = await Promise.all([
        getMenuItemById(itemId),
        getAllCategories()
      ]);

      console.log("Fetched Item DTO:", itemDto);
      console.log("Fetched Categories:", fetchedCategories);

      if (!itemDto || !fetchedCategories) {
        throw new Error("Missing item or category data from API.");
      }

      setFormData({
        name: itemDto.name || '',
        description: itemDto.description || '',
        price: itemDto.price?.toString() || '',
        categoryId: itemDto.categoryId?.toString() || '', // Use categoryId
        imageUrl: itemDto.imageUrl || '',
        isAvailable: itemDto.isAvailable // Match DTO
      });

      // FIX 2: Use the correct image URL logic
      const correctImageUrl = itemDto.imageUrl
        ? `${API_BASE_URL.replace('/api', '')}${itemDto.imageUrl.startsWith('/') ? itemDto.imageUrl : '/' + itemDto.imageUrl}`
        : bowlImage;
      console.log("Setting Image Preview URL:", correctImageUrl); // Add log to check URL
      setImagePreview(correctImageUrl);

      setCategories(fetchedCategories || []);
      setOriginalData({
        ...itemDto,
        price: itemDto.price?.toString(),
        categoryId: itemDto.categoryId?.toString()
      });

      const timer = setTimeout(() => {
        setIsVisible(prev => ({ ...prev, content: true, form: true }));
      }, 150);

    } catch (err) { // Use 'err' to avoid conflict with 'error' state
      console.error('Error fetching data:', err);
      const errorMsg = `Failed to load item data: ${err.message}`;
      setError(errorMsg); // Set the error state
      showError(errorMsg);
      // Don't redirect here, let the 'if (error)' block in render handle it
    } finally {
      setIsLoading(false);
    }
  }, [itemId, isAuthenticated, navigate, showError]);

  // Trigger fetch on load/auth change
  useEffect(() => {
    if (!authIsLoading && isAuthenticated && itemId) {
      fetchData();
    }
    if (!authIsLoading && !isAuthenticated) {
      showError("Please log in to manage menu items.");
      navigate('/login', { replace: true });
    }
  }, [authIsLoading, isAuthenticated, itemId, fetchData, navigate, showError]);

  // --- Animation Observers ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true }));
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    // Only run observer setup *after* loading is complete
    if (!isLoading && !error) { // Don't run if loading or if fetch failed
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach(section => observer.observe(section));
    }
    return () => observer.disconnect();
  }, [isLoading, error]); // Re-run observer setup after loading/error changes

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valToSet = type === 'checkbox' ? checked : value;
    // Match state: 'isActive' checkbox maps to 'isAvailable'
    const stateName = name === 'isActive' ? 'isAvailable' : name;

    setFormData(prev => ({
      ...prev,
      [stateName]: valToSet
    }));
    if (errors[stateName]) setErrors(prev => ({ ...prev, [stateName]: '' }));
  };

  const handleImageChange = (e) => {
    showError("Image updates are not supported here. To change the image, please delete and recreate the item.");
    e.target.value = null;
  };

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 3) newErrors.name = 'Item name must be at least 3 characters';
    if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be a valid number greater than 0';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    return newErrors;
  };

  // --- Change Detection ---
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.price !== originalData.price?.toString() ||
      formData.categoryId !== originalData.categoryId?.toString() ||
      formData.isAvailable !== originalData.isAvailable
    );
  };

  // --- Submit (Update) Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      showError("Please correct the errors in the form.");
      return;
    }
    if (!hasChanges()) {
      showError("No changes detected to save.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const updateData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      imageUrl: originalData.imageUrl, // Send back original URL
      isAvailable: formData.isAvailable
    };

    try {
      await updateMenuItem(itemId, updateData);
      showSuccess(`Menu item "${formData.name}" updated successfully!`);
      navigate('/admin/menu', { replace: true, state: { refresh: true } });
    } catch (err) { // Use 'err'
      console.error('Error updating menu item:', err);
      const errorMsg = `Update failed: ${err.message}`;
      showError(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler ---
  const handleDelete = async () => {
    const itemName = formData.name || originalData?.name || `Item #${itemId}`;
    if (window.confirm(`Are you sure you want to permanently delete "${itemName}"? This cannot be undone.`)) {
      setIsSubmitting(true);
      setErrors({});
      try {
        await deleteMenuItem(itemId);
        showSuccess(`Menu item "${itemName}" deleted successfully.`);
        navigate('/admin/menu', { replace: true, state: { refresh: true } });
      } catch (err) { // Use 'err'
        console.error('Error deleting menu item:', err);
        const errorMsg = `Delete failed: ${err.message}`;
        showError(errorMsg);
        setErrors({ submit: errorMsg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // --- Render Logic ---
  if (authIsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-yellow-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg font-medium text-gray-700">{authIsLoading ? "Verifying..." : "Loading Item..."}</span>
      </div>
    );
  }

  // Show error state if fetch failed (uses 'error' state)
  if (error) {
    return (
      <div className="min-h-screen relative font-sans bg-gray-50">
        <div className="absolute w-full z-50"><AdminNavigation /></div>
        <div className="pt-40 pb-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center"> <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> D:  </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Item</h2>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button onClick={() => navigate('/admin/menu')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"> Back to Menu </button>
        </div>
      </div>
    );
  }

  // --- Main JSX Return (Using static structure with dynamic data) ---
  return (
    <div className="min-h-screen relative font-sans bg-gray-50">
      <div className="absolute w-full z-50"><AdminNavigation /></div>

      {/* Hero Section */}
      <div
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center center' }}
      >
        <div className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="hero" >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6"> Edit Menu Item </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed"> Update details for: <span className="font-semibold">{originalData?.name || '...'}</span> </p>
        </div>
        {/* Back Button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30"> <div className="bg-white/20 backdrop-blur-sm rounded-full p-3"> <button onClick={() => navigate('/admin/menu')} className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2" > <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Menu </button> </div> </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} data-section="content" >
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <button onClick={() => navigate('/admin/menu')} className="hover:text-yellow-600 font-medium">Menu</button> <span>/</span>
              <span className="text-gray-900 font-semibold">Edit Item #{itemId}</span>
            </div>
          </div>

          {/* Form Section */}
          <div className={`bg-white rounded-xl border border-gray-200 p-8 transition-all duration-1000 ease-out ${isVisible.form ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} data-section="form" >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Menu Item Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Reduced space */}
              {/* Item Name */}
              <div className={`transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">Item Name *</label>
                {/* FIX: Added text-gray-800 and placeholder-gray-400 */}
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400 bg-white ${errors.name ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-yellow-300 focus:border-yellow-400'}`} placeholder="Enter item name" />
                {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className={`transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">Description *</label>
                {/* FIX: Added text-gray-800 and placeholder-gray-400 */}
                <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleInputChange} maxLength={500} className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 resize-none text-gray-800 placeholder-gray-400 bg-white ${errors.description ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-yellow-300 focus:border-yellow-400'}`} placeholder="Describe the dish..." />
                <div className="mt-1 flex justify-between items-center">
                  {errors.description ? <p className="text-xs text-red-600 font-medium">{errors.description}</p> : <p className="text-xs text-gray-500">Max 500 characters.</p>}
                  <span className={`text-xs font-medium ${formData.description.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>{formData.description.length}/500</span>
                </div>
              </div>

              {/* Price and Category Row */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-2">Price (₱) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500">₱</span></div>
                    {/* FIX: Added text-gray-800 and placeholder-gray-400 */}
                    <input type="number" id="price" name="price" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className={`block w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400 bg-white ${errors.price ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-yellow-300 focus:border-yellow-400'}`} placeholder="0.00" />
                  </div>
                  {errors.price && <p className="mt-1 text-xs text-red-600 font-medium">{errors.price}</p>}
                </div>
                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-800 mb-2">Category *</label>
                  <div className="relative">
                    {/* FIX: Added text-gray-800 */}
                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={`block w-full appearance-none px-4 py-3 pr-8 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 bg-white cursor-pointer text-gray-800 ${errors.categoryId ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-yellow-300 focus:border-yellow-400'}`} >
                      <option value="" disabled className="text-gray-400">Select category</option>
                      {/* Populate with fetched categories */}
                      {categories.map(cat => (<option key={cat.categoryId} value={cat.categoryId.toString()} className="text-gray-800">{cat.name}</option>))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"> <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> </div>
                  </div>
                  {errors.categoryId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.categoryId}</p>}
                </div>
              </div>


              {/* Image Upload - Display Only for Edit */}
              <div className={`transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Item Image</label>
                <div className="space-y-4">
                  {/* Current Image Preview */}
                  {imagePreview && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Image</h4>
                      <div className="flex items-center justify-center">
                        <img src={imagePreview} alt="Current" className="max-h-40 max-w-full object-contain rounded-md shadow-sm" onError={(e) => { e.target.src = bowlImage; }} />
                      </div>
                    </div>
                  )}
                  {/* Upload Disabled Message */}
                  <div className="flex justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <p className="mt-1 text-xs text-gray-500">Image cannot be updated after creation.</p>
                    </div>
                  </div>
                  {/* Removed file input */}
                </div>
              </div>

              {/* Status */}
              <div className={`bg-gray-50 rounded-lg p-4 transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                {/* Use isAvailable for name and checked */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleInputChange} className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2" />
                  <span className="text-sm font-semibold text-gray-800"> Make this item active and available </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 pl-7">Active items will be visible to customers.</p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className={`bg-red-50 border border-red-200 rounded-lg p-3 transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`}>
                  {/* ... Error Icon and Message ... */}
                  <div className="flex items-center gap-2"> <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> <p className="text-xs text-red-700 font-medium">{errors.submit}</p> </div>
                </div>
              )}

              {/* Form Actions (Update & Delete) */}
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '700ms' }}>
                {/* Delete Button (Left Aligned) */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting} // Disable while submitting update or delete
                  className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md border border-red-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete Item
                </button>

                {/* Cancel and Update Buttons (Right Aligned) */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button type="button" onClick={() => navigate('/admin/menu')} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md border border-gray-200 w-1/2 sm:w-auto" > Cancel </button>
                  <button type="submit" disabled={isSubmitting || !hasChanges()} className="px-8 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-1.5 w-1/2 sm:w-auto" >
                    {isSubmitting ? (<> <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Updating...</>) : (<> <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Update Item </>)}
                  </button>
                </div>
              </div>

              {/* No Changes Message */}
              {!hasChanges() && !isSubmitting && (
                <div className={`text-center py-2 transition-opacity duration-500 ease-out ${isVisible.form ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                  <p className="text-xs text-gray-500">No changes detected. Modify the form to enable the update button.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditMenu;

