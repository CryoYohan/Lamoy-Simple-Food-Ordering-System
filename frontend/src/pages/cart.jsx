import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/dynamicNavbar";
import bgImage from "../assets/MAIN4.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bowlImage from "../assets/bowl.png"; // Import the bowl image

const CartPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    cartItems: false,
    summary: false,
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: "",
  });

  // Clear cart confirmation modal state
  const [clearCartModal, setClearCartModal] = useState(false);

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

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  // Set hero section visible immediately on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, hero: true }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Function to dispatch cart update event
  const dispatchCartUpdate = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = cartItems.map((item) =>
      item.itemId === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    // 🔥 Dispatch cart update event
    dispatchCartUpdate();
  };

  const removeItem = (itemId) => {
    const itemToDelete = cartItems.find((item) => item.itemId === itemId);
    setDeleteModal({
      isOpen: true,
      itemId: itemId,
      itemName: itemToDelete?.name || "this item",
    });
  };

  const confirmDelete = () => {
    const updated = cartItems.filter(
      (item) => item.itemId !== deleteModal.itemId
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    dispatchCartUpdate();
    setDeleteModal({ isOpen: false, itemId: null, itemName: "" });
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, itemId: null, itemName: "" });
  };

  // Clear entire cart function
  const clearCart = () => {
    setClearCartModal(true);
  };

  const confirmClearCart = () => {
    setCartItems([]);
    localStorage.setItem("cart", JSON.stringify([]));
    dispatchCartUpdate();
    setClearCartModal(false);
  };

  const cancelClearCart = () => {
    setClearCartModal(false);
  };

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen relative font-sans bg-white">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Remove Item?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                "{deleteModal.itemName}"
              </span>{" "}
              from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {clearCartModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Clear Cart?
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                all items ({cartItems.length})
              </span>{" "}
              from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelClearCart}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      {/* Upper background image with centered header content */}
      <div
        className="relative top-0 left-0 w-full h-96 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            My Cart
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Review the items you've added and make changes before placing your
            order
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

      {/* Cart Content Section */}
      <div className="bg-white pt-15 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${
              isVisible.content
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
              <span className="text-gray-900 font-semibold">Cart</span>
            </div>
            <button
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate("/orders")}
            >
              View Orders
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shopping Cart */}
            <div className="lg:col-span-2">
              <div
                className={`bg-white rounded-xl p-10 border border-gray-200 transition-all duration-1000 ease-out ${
                  isVisible.cartItems
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

                {/* Cart Items */}
                <div className="space-y-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2-2m2 2l-2 2M9 21a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add some delicious items from our menu to get started!
                      </p>
                      <button
                        onClick={() => navigate("/menu")}
                        className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div
                        key={item.itemId}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 bg-white w-full"
                      >
                        {/* Image */}
                        <div className="w-full sm:w-24 h-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 mb-4 sm:mb-0">
                          <img
                            src={
                              item.image && item.image !== bowlImage
                                ? item.image
                                : bowlImage
                            }
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              e.target.src = bowlImage;
                              e.target.className =
                                "w-full h-full object-contain rounded-xl";
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col sm:flex-1 sm:ml-6 w-full">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mt-1">
                            {item.description || "Delicious menu item"}
                          </p>

                          {/* Quantity + Price */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 w-full">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.itemId, item.quantity - 1)
                                }
                                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition"
                              >
                                -
                              </button>
                              <span className="min-w-[2rem] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.itemId, item.quantity + 1)
                                }
                                className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition"
                              >
                                +
                              </button>
                            </div>

                            <div className="mt-3 sm:mt-0 text-gray-900 font-bold text-lg sm:text-xl">
                              ₱ {(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="mt-4 sm:mt-0 sm:ml-4 w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Clear Cart Button (Optional) */}
                {cartItems.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={clearCart}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div
                className={`bg-white rounded-xl border border-gray-200 p-6 sticky top-4 transition-all duration-1000 ease-out ${
                  isVisible.summary
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                data-section="summary"
              >
                <h3 className="font-bold text-xl text-gray-900 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.itemId}
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

                <hr className="border-gray-200 mb-6" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ₱ {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Proceed Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
