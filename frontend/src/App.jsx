import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/login.jsx';
import SignUpPage from './pages/signup.jsx';
import Landing from './pages/landing';
import Home from './pages/home';
import ForgotPassword from './pages/forgotPassword';
import Menu from './pages/menu'; 

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/menu" element={<Menu />} /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;