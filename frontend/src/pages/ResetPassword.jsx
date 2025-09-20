import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isVisible, setIsVisible] = useState({
    hero: false,
    form: false
  });
  const navigate = useNavigate();

  // Scroll animation setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsVisible(prev => ({ ...prev, hero: true }));
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
        setMessage('Passwords do not match');
        setMessageType('error');
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch('http://localhost:5143/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        } else {
        // Parse plain text responses safely
        data = { message: await response.text() };
        }

        if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => navigate('/login'), 3000);
        } else {
        setMessage(data.message || 'Failed to reset password.');
        setMessageType('error');
        }
    } catch (err) {
        console.error(err);
        setMessage('Something went wrong. Try again later.');
        setMessageType('error');
    } finally {
        setIsLoading(false);
    }
    };


  const handleBackToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Background image top half */}
      <div 
        className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* White bottom half */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white" />

      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero text */}
        <div 
          className={`text-center mb-8 sm:mb-12 mt-16 sm:mt-20 transition-all duration-1000 ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Set Your New Password
          </h1>
          <p className="text-white/90 text-base sm:text-lg px-4 max-w-md sm:max-w-lg mx-auto">
            Enter your new password below to reset your account.
          </p>
        </div>

        {/* Form */}
        <div 
          className={`w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-1000 ${
            isVisible.form ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="form"
          style={{ transitionDelay: '300ms' }}
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-8 sm:mb-10 text-center">
              New Password
            </h2>

            {/* Message display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg text-sm sm:text-base ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
                Remember your password?{' '}
                <button 
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-yellow-500 hover:text-yellow-600 font-semibold hover:underline transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
