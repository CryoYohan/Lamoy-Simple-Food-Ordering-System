import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/dynamicNavbar";
import bgImage from "../assets/MAIN4.png";
import bowlImage from "../assets/BOWL.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CheckOutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    console.log(user);
  }, []);
  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    cartItems: false,
    userInfo: false,
    summary: false,
  });

  // Intersection Observer for scroll animations
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
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Set hero visible immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Load cart from localStorage
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  // ✅ User info from AuthContext
  const userInfo = {
    name: user?.name || "Guest",
    number: user?.phoneNumber || "N/A",
    address: user?.address || "No address provided",
  };

  // ✅ Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Checkout with API
  const handleCheckout = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty!");
      return;
    }

    const payload = {
      userId: user?.userId,
      deliveryAddress: user?.address,
      items: cartItems.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const res = await fetch("http://localhost:5143/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order placed successfully! Order ID: " + data.orderId);
        localStorage.removeItem("cart"); // clear cart
        navigate("/orders"); // redirect to orders page
      } else {
        alert("Checkout failed: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen relative font-sans">
      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Upper background image */}
      <div
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div
          className={`transition-all duration-1000 ease-out ${isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
            }`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Checkout
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Securely complete your order and choose your payment method
          </p>
        </div>

        {/* Browse button */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <button
              onClick={() => navigate("/menu")}
              className="bg-white px-8 py-3 rounded-full font-semibold text-lg text-yellow-500 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Browse +
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Content Section */}
      <div className="bg-gray-50 pt-15 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${isVisible.content
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }`}
            data-section="content"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-800">
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
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate("/cart")}
            >
              Back to Cart
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shopping Cart */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-1000 ease-out ${isVisible.cartItems
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                  }`}
                data-section="cartItems"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Shopping Cart
                </h2>
                <p className="text-gray-700 mb-6 font-medium">
                  Cart Items ({cartItems.length})
                </p>

                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-500 ease-out ${isVisible.cartItems
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                        }`}
                      style={{
                        transitionDelay: isVisible.cartItems
                          ? `${200 + index * 100}ms`
                          : "0ms",
                      }}
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                        <img
                          src={item.image || bowlImage}
                          alt={item.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-700 text-sm font-medium">
                          {item.description}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mr-4">
                        <span className="min-w-[2rem] text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-right mr-4">
                        <div className="bg-yellow-100 text-yellow-400 px-4 py-1.5 rounded-full font-medium text-sm">
                          ₱ {item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Information */}
              <div
                className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-1000 ease-out ${isVisible.userInfo
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                  }`}
                data-section="userInfo"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">
                  User Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Name
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium">
                      {userInfo.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Number
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium">
                      {userInfo.number}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Address
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium leading-relaxed">
                      {userInfo.address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div
                className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-1000 ease-out ${isVisible.summary
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                  }`}
                data-section="summary"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">
                  Payment Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-800 font-medium">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-bold text-gray-900">
                        ₱ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-300 mb-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ₱ {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;