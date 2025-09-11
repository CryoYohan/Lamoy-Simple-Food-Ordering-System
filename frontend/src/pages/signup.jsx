import React, { useState } from 'react';
import Navigation from '../components/navbar';
import bgImage from '../assets/MAIN4.png';
import { useNavigate } from 'react-router-dom';


const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    console.log('Sign up clicked with:', { 
      username, 
      email, 
      fullname,
      address,
      phoneNumber,
      password 
    });
  };

  const handleSignIn = () => {
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
        <Navigation />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="text-center mb-8 mt-20">
          <h1 className="text-white text-4xl font-bold mb-4">Get Started</h1>
          <p className="text-white/90 text-lg">
            Sign up now and enjoy quick, simple, and hassle-free<br />
            food ordering—Filipino style.
          </p>
        </div>
        
        <div className="w-full max-w-2xl bg-white/20 backdrop-blur-sm rounded-3xl p-4">
          <div className="w-full bg-white rounded-3xl p-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
              Sign Up to <span className="text-yellow-500">Lamoy</span>
            </h2>
          
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Username and Full Name in two columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                  required
                />
              </div>

              {/* Phone Number and Password in two columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 resize-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 mt-6"
              >
                Sign Up
              </button>
              
              <div className="text-center text-sm text-gray-600 pt-2">
                Already have an Account?{' '}
                <button 
                  type="button"
                  onClick={handleSignIn}
                  className="text-yellow-500 hover:text-yellow-600 font-semibold hover:underline transition-all"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;