import React, { useState } from 'react';
import Navigation from '../components/navbar';

const WelcomeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    console.log('Sign in clicked with:', { email, password });
    // login logic diri
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // mo padung sa Forgot password nga page
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
    // Diri register nga page
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="bg-yellow-500 px-6 pt-16 pb-32 text-center">
        <h1 className="text-white text-4xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-white text-sm opacity-90">
          Access your account and enjoy your favorite<br />
          Filipino meals anytime.
        </p>
      </div>

      <div className="px-6 -mt-24 pb-16">
        <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Sign In to <span className="text-yellow-500">Lamoy</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-colors"
                placeholder=""
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm text-gray-600 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-colors"
                placeholder=""
              />
            </div>
            
            <div className="text-right">
              <button 
                onClick={handleForgotPassword}
                className="text-sm text-yellow-500 hover:text-yellow-600 transition-colors underline"
              >
                Forgot Password?
              </button>
            </div>
            
            <button
              onClick={handleSignIn}
              className="w-full bg-yellow-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Sign In
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-6">
              <button 
                onClick={handleCreateAccount}
                className="text-yellow-500 hover:text-yellow-600 font-medium underline"
              >
                Don't have an Account? Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeLogin;