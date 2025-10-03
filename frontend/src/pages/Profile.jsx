import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    profileInfo: false,
    actions: false
  });

  // Mock user profile data (in real app, this would come from API or context)
  const [profileData, setProfileData] = useState({
    fullName: user?.name || user?.UserName || 'John Doe',
    username: user?.UserName || 'johndoe123',
    email: user?.email || 'john.doe@example.com',
    phoneNumber: '+63 912 345 6789',
    address: '123 Rizal Street, Barangay San Jose, Manila, Philippines',
    joinDate: 'January 2024',
    totalOrders: 15,
    profileImage: null // We'll use a placeholder
  });

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleEditProfile = () => {
    // In a real app, this would navigate to an edit profile page
    alert('Edit profile functionality coming soon!');
  };

  const handleChangePassword = () => {
    // In a real app, this would navigate to a change password page
    alert('Change password functionality coming soon!');
  };

  return (
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <DynamicNavigation />
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
              onClick={handleEditProfile}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Edit Profile
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
                className={`bg-white rounded-xl p-8 border border-gray-200 text-center transition-all duration-1000 ease-out ${
                  isVisible.profileInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="profileInfo"
              >
                {/* Profile Image Placeholder */}
                <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-20 h-20 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profileData.fullName}</h2>
                <p className="text-gray-600 mb-4">@{profileData.username}</p>
                
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Orders:</span>
                    <span className="text-yellow-600 font-bold text-xl">{profileData.totalOrders}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm">Member since {profileData.joinDate}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div 
                className={`bg-white rounded-xl p-8 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.profileInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="profileInfo"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">{profileData.fullName}</p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Username
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">{profileData.username}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">{profileData.email}</p>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">{profileData.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Address
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 font-medium">{profileData.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                className={`mt-8 grid md:grid-cols-2 gap-4 transition-all duration-1000 ease-out ${
                  isVisible.actions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                data-section="actions"
              >
                <button 
                  onClick={handleEditProfile}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;