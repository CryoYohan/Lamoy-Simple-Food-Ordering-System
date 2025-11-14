import React, { useState, useEffect, useCallback } from 'react';
// FIX: Added file extensions to imports
import DynamicNavigation from '../components/dynamicNavbar.jsx';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
// 1. Import the new, secure service functions
import { getUserProfile, updateUserProfile } from '../services/authService.js';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  // Data and state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  // Animation state
  const [isVisible, setIsVisible] = useState({
    // ... existing code ...
    content: false,
    profileInfo: false,
    actions: false
  });

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    // ... existing code ...
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        // ... existing code ...
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        // ... existing code ...
      });
    } catch {
      return 'Invalid Date';
      // ... existing code ...
    }
  };

  // --- Data Fetching ---
  // 2. Updated fetchProfile to use the secure endpoint (no userId param needed)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(); // Calls GET /api/user/profile
      setProfileData(data);
      // Pre-fill form data with fetched data
      setFormData({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message);
      showError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [showError]); // Removed userId dependency

  // --- Effects ---

  // Auth check and initial data fetch
  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      // Call fetchProfile without ID, just check if authenticated
      if (isAuthenticated) {
        fetchProfile();
      }
    }
  }, [isAuthenticated, authIsLoading, navigate, fetchProfile]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    // ... existing code ...
    if (loading || error) return; // Don't run observer if data isn't ready

    const observer = new IntersectionObserver(
      (entries) => {
        // ... existing code ...
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              // ... existing code ...
              ...prev,
              [entry.target.dataset.section]: true
            }));
            // ... existing code ...
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-section]');
    // ... existing code ...
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [loading, error]); // Rerun if loading/error state changes

  // Set hero section visible immediately on mount
  useEffect(() => {
    // ... existing code ...
    const timer = setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  // --- Event Handlers ---

  const handleEditToggle = () => {
    // ... existing code ...
    setIsEditing(prev => !prev);
    // If we're canceling, reset form data to match the (potentially updated) profile
    if (isEditing && profileData) {
      setFormData({
        // ... existing code ...
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        // ... existing code ...
      });
    }
  };

  const handleChangePassword = () => {
    // ... existing code ...
    navigate('/forgot-password'); // Or a dedicated 'change password' route
  };

  const handleFormChange = (e) => {
    // ... existing code ...
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // ... existing code ...
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // 4. No need to check user.userId, just check if submitting
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // 5. Call the new secure update function (no ID needed)
      const updatedUser = await updateUserProfile(formData);
      setProfileData(updatedUser); // Update local state with server response
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError(`Failed to update profile: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Render Logic ---

  if (authIsLoading || loading) { // Check both loading states
    return (
      // ... existing code ...
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg font-medium text-gray-700">Loading Profile...</span>
      </div>
      // ... existing code ...
    );
  }

  if (error) {
    // ... existing code ...
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="text-xl font-semibold text-red-700 mb-2">Error Loading Profile</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={fetchProfile} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
            Retry Loading
          </button>
        </div>
      </div>
      // ... existing code ...
    );
  }

  // Fallback check, though loading/error should catch it
  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="ml-3 text-lg font-medium text-gray-700">No profile data found.</span>
      </div>
    );
  }

  return (
    // ... existing code ...
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Hero Section */}
      <div
        // ... existing code ...
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          // ... existing code ...
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      // ... existing code ...
      >
        <div
          className={`transition-all duration-1000 ease-out ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            My Profile
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Manage your account information and preferences
          </p>
        </div>

        {/* Edit Profile button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={handleEditToggle}
              // ... existing code ...
              className={`bg-white px-8 py-3 rounded-full font-semibold text-lg transition-colors shadow-lg ${isEditing
                ? 'text-red-500 hover:bg-gray-50'
                : 'text-yellow-500 hover:bg-gray-50'
                }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-800">
              <button onClick={() => navigate('/home')} className="hover:text-yellow-600 font-medium">Home</button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Profile</span>
            </div>
            <button
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div
                className={`bg-white rounded-xl p-8 border border-gray-200 text-center transition-all duration-1000 ease-out ${isVisible.profileInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                data-section="profileInfo"
              >
                {/* Profile Image Placeholder */}
                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.fullName}</h2>
                <p className="text-gray-600 mb-4">@{profileData.userName}</p>

                <p className="text-gray-500 text-sm">Member since {formatDate(profileData.createdAt)}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${isVisible.profileInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                data-section="profileInfo"
              >
                {/* Form or Display Content */}
                <form onSubmit={handleSaveProfile}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleFormChange}
                        disabled={!isEditing || isUpdating}
                        className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    {/* Username (Read-only) */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Username
                      </label>
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-500 font-medium">{profileData.userName}</p>
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-500 font-medium">{profileData.email}</p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing || isUpdating}
                        className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-yellow-500"
                        placeholder={isEditing ? 'e.g., 09123456789' : 'N/A'}
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor="address" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Address
                      </label>
                      <textarea
                        name="address"
                        id="address"
                        rows="3"
                        value={formData.address || ''}
                        onChange={handleFormChange}
                        disabled={!isEditing || isUpdating}
                        className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-yellow-500"
                        placeholder={isEditing ? 'e.g., 123 Rizal St, Brgy. San Jose, Manila' : 'N/A'}
                      />
                    </div>
                  </div>

                  {/* Save/Cancel buttons (Only show in edit mode) */}
                  {isEditing && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleEditToggle} // This is now the "Cancel" action
                        disabled={isUpdating}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Action Buttons (Only show when NOT editing) */}
              {!isEditing && (
                <div
                  className={`mt-8 grid md:grid-cols-2 gap-4 transition-all duration-1000 ease-out ${isVisible.actions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                  data-section="actions"
                >
                  <button
                    onClick={handleEditToggle}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={handleChangePassword}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Change Password</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
