import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/login.jsx';
import SignUpPage from './pages/signup.jsx';
import Landing from './pages/landing';
import Home from './pages/home';
import ForgotPassword from './pages/forgotPassword';
import Menu from './pages/menu'; 
import CheckOutPage from './pages/checkOut.jsx';
import ResetPassword from './pages/ResetPassword';
import CartPage from './pages/cart.jsx';
import ViewOrderPage from './pages/ViewOrder';
import TrackOrderPage from './pages/TrackOrder';
import OrdersPage from './pages/orders';
import ProfilePage from './pages/Profile';


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
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckOutPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/view-order/:orderId" element={<ViewOrderPage />} />
          <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;