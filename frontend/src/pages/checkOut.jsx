import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/dynamicNavbar";
import bgImage from "../assets/MAIN4.png";
import bowlImage from "../assets/BOWL.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// 1. Import useToast and the service function
import { useToast } from "../context/ToastContext";
import { createOrder } from "../services/orderService";

const CheckOutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Assuming 'user' contains { userId, name, phoneNumber, address }
  const { showSuccess, showError } = useToast(); // Use toast

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      showError("Please log in to proceed to checkout.");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, showError]);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    /* ... */
  });
  // ... (Your useEffects for animation remain the same) ...
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load cart from localStorage
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
    // Trigger cartItems animation after cart loads
    if (storedCart.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible((prev) => ({ ...prev, cartItems: true }));
      }, 300); // Delay after hero
      return () => clearTimeout(timer);
    }
  }, []); // Only run on mount

  // User info (using optional chaining for safety)
  const userInfo = {
    name: user?.name ?? "Guest", // Use user.name if available
    number: user?.phoneNumber ?? "N/A",
    address: user?.address ?? "No address provided",
  };
  // Trigger userInfo/summary animation after user context loads
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsVisible((prev) => ({ ...prev, userInfo: true, summary: true }));
      }, 500); // Delay after cart items
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, // Ensure price/quantity are numbers
    0
  );

  const [isCheckingOut, setIsCheckingOut] = useState(false); // Loading state for checkout button

  //
  // --- UPDATED CHECKOUT HANDLER ---
  //
  const handleCheckout = async () => {
    if (!isAuthenticated || !user?.userId) {
      showError("Authentication error. Please log in again.");
      navigate("/login");
      return;
    }
    if (!cartItems.length) {
      showError("Your cart is empty!");
      return;
    }
    if (!user.address) {
      showError(
        "Please add a delivery address to your profile before checking out."
      );
      // Optional: navigate('/profile');
      return;
    }

    setIsCheckingOut(true);

    // 2. Prepare payload matching backend DTO
    const payload = {
      userId: user.userId, // Use userId from context
      deliveryAddress: user.address, // Use address from context
      items: cartItems.map((item) => ({
        itemId: item.itemId, // Use itemId from cart item
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      // 3. Call the service function
      const data = await createOrder(payload); // Returns { message, orderId }

      // 4. Handle success
      showSuccess(`Order Placed! ${data.message} (ID: ${data.orderId})`);
      localStorage.removeItem("cart"); // clear cart
      setCartItems([]); // Clear local state
      window.dispatchEvent(new Event("cartUpdated")); // Update navbar count
      navigate("/orders"); // redirect to orders page
    } catch (error) {
      // 5. Handle errors from service (already parsed JSON)
      console.error("Checkout error:", error);
      showError(`Checkout failed: ${error.message || "Please try again."}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans bg-gray-50">
      {/* Navigation */}
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Hero Section */}
      <div
        className="relative w-full h-64 sm:h-80 md:h-96 bg-cover bg-center flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Checkout
          </h1>
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Securely complete your order and finalize your purchase
          </p>
        </div>

        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={() => navigate("/menu")}
              className="bg-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-lg text-yellow-500 hover:bg-gray-50 shadow-lg transition-colors"
            >
              Browse Menu +
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="bg-gray-50 pt-16 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 transition-all duration-800 ease-out ${
              isVisible.content
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            data-section="content"
          >
            <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-800 mb-2 sm:mb-0">
              <button
                onClick={() => navigate("/menu")}
                className="hover:text-yellow-600 font-medium"
              >
                Menu
              </button>
              <span>/</span>
              <button
                onClick={() => navigate("/cart")}
                className="hover:text-yellow-600 font-medium"
              >
                Cart
              </button>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Checkout</span>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="px-4 sm:px-6 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium shadow-sm transition-colors text-sm sm:text-base"
            >
              Back to Cart
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-sm transition-all duration-1000 ease-out ${
                  isVisible.cartItems
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                data-section="cartItems"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Order Items
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-6 font-medium">
                  ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in
                  your cart)
                </p>

                {cartItems.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.itemId || index}
                        className="flex flex-col sm:flex-row items-center sm:items-start p-3 sm:p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow duration-300 bg-white"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-0 sm:mr-4 mb-3 sm:mb-0 overflow-hidden shadow-sm">
                          <img
                            src={item.image || bowlImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = bowlImage;
                              e.target.className = "w-12 h-12 object-contain";
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow min-w-0 mb-2 sm:mb-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                            {item.name}
                          </h3>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-4">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">
                            Qty: {item.quantity}
                          </span>
                          <div className="bg-yellow-100 text-yellow-500 px-2 py-1 rounded-full font-bold text-sm sm:text-base">
                            ₱ {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600 font-medium">
                      Your cart is empty.
                    </p>
                    <button
                      onClick={() => navigate("/menu")}
                      className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                    >
                      Browse Menu
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Delivery Info */}
              <div
                className={`bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-1000 ease-out ${
                  isVisible.userInfo
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                data-section="userInfo"
                style={{ transitionDelay: "200ms" }}
              >
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-5">
                  Delivery Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Name
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm">
                      {userInfo.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm">
                      {userInfo.number}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Delivery Address
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium text-sm leading-relaxed">
                      {userInfo.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div
                className={`bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm transition-all duration-1000 ease-out ${
                  isVisible.summary
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                data-section="summary"
                style={{ transitionDelay: "400ms" }}
              >
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4 sm:mb-5">
                  Payment Summary
                </h3>
                <div className="flex justify-between items-center mb-3 sm:mb-4 text-gray-700 font-medium">
                  <span>Subtotal</span>
                  <span>₱ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4 sm:mb-6 text-gray-700 font-medium">
                  <span>Delivery Fee</span>
                  <span>₱ 0.00</span>
                </div>
                <hr className="border-gray-200 mb-4 sm:mb-5" />
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    ₱ {total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={
                    isCheckingOut || cartItems.length === 0 || !user?.address
                  }
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white py-3 sm:py-3 rounded-lg font-bold text-lg sm:text-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Confirm & Place Order"
                  )}
                </button>
                {!user?.address && cartItems.length > 0 && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please add a delivery address to your profile.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
