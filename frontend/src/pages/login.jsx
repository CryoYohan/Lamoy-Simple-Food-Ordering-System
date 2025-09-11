import React, { useState } from 'react';
import Navigation from '../components/navbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';



const WelcomeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log('Sign in clicked with:', { email, password });
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
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
        <Navigation />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-13">
          <h1 className="text-white text-4xl font-bold mb-4">Welcome!</h1>
          <p className="text-white/90 text-lg">
            Access your account and enjoy your favorite<br />
            Filipino meals anytime.
          </p>
        </div>
        
        <div className="w-full max-w-lg bg-white/20 backdrop-blur-sm rounded-3xl p-4">
          <div className="w-full bg-white rounded-3xl  p-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-700 mb-10 text-center">
              Sign In to <span className="text-yellow-500">Lamoy</span>
            </h2>
          
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                  required
                />
              </div>
              
              <div className="text-right">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-yellow-500 hover:text-yellow-600 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200"
              >
                Sign In
              </button>
              
              <div className="text-center text-sm text-gray-600 pt-2">
                Don't have an Account?{' '}
                <button 
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-yellow-500 hover:text-yellow-600 font-semibold hover:underline transition-all"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeLogin;