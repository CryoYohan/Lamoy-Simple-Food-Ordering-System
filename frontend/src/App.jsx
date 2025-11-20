import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Add Navigate here
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/Toast";
import LoginPage from "./pages/login.jsx";
import SignUpPage from "./pages/signup.jsx";
import Landing from "./pages/landing";
import Home from "./pages/home";
import ForgotPassword from "./pages/forgotPassword";
import Menu from "./pages/menu";
import CheckOutPage from "./pages/checkOut.jsx";
import ForgotResetPassword from "./pages/forgotResetPassword.jsx";
import ProfileResetPassword from "./pages/profileResetPassword.jsx";
import CartPage from "./pages/cart.jsx";
import OrdersPage from "./pages/orders";
import ViewOrderPage from "./pages/ViewOrder.jsx";
import TrackOrderPage from "./pages/trackOrder.jsx";
import ProfilePage from "./pages/profile.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/orders/AdminOrders";
import AdminViewOrder from "./pages/admin/orders/AdminViewOrder";
import AdminMenu from "./pages/admin/menu/AdminMenu";
import AdminCreateMenu from "./pages/admin/menu/AdminCreateMenu";
import AdminEditMenu from "./pages/admin/menu/AdminEditMenu";
import AdminViewMenu from "./pages/admin/menu/AdminViewMenu";

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ToastContainer />
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckOutPage />} />
            <Route path="/reset-password" element={<ForgotResetPassword />} />
            <Route
              path="/profile-reset-password"
              element={<ProfileResetPassword />}
            />
            <Route path="/view-order" element={<ViewOrderPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/view-order/:orderId" element={<ViewOrderPage />} />
            <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route
              path="/admin/orders/view/:orderId"
              element={<AdminViewOrder />}
            />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/menu/create" element={<AdminCreateMenu />} />
            <Route
              path="/admin/menu/edit/:itemId"
              element={<AdminEditMenu />}
            />
            <Route
              path="/admin/menu/view/:itemId"
              element={<AdminViewMenu />}
            />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
