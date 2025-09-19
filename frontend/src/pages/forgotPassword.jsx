import React, { useState, useEffect } from 'react';
import DynamicNavigation from '../components/dynamicNavbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isVisible, setIsVisible] = useState({
    hero: false,
    form: false
  });
  const navigate = useNavigate();

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

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // Set hero section visible immediately on mount
  useEffect(() => {
    setIsVisible(prev => ({ ...prev, hero: true }));
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5143/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
        }),
      });

      if (response.ok) {
        // Remove the unused data variable
        await response.json(); // Just consume the response
        setMessage('Password reset instructions have been sent to your email.');
        setMessageType('success');
        setEmail(''); // Clear the form
      } else {
        const error = await response.text();
        setMessage(error || 'Failed to send reset instructions. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again later.');
      setMessageType('error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Upper half with background image */}
      <div 
        className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      />
      {/* Lower half with white background */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white" />
      
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div 
          className={`text-center mb-8 sm:mb-12 mt-16 sm:mt-20 transition-all duration-1000 ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">Forgot Password?</h1>
          <p className="text-white/90 text-base sm:text-lg px-4 max-w-md sm:max-w-lg mx-auto">
            Don't worry! Enter your email address and we'll send you
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            instructions to reset your password.
          </p>
        </div>
        
        <div 
          className={`w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-1000 ${
            isVisible.form ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          data-section="form"
          style={{ transitionDelay: '300ms' }}
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-8 sm:mb-10 text-center">
              Reset Your Password
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
          
            <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword;