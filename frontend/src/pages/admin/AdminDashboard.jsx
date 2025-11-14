import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminNavigation from "../../components/admin/adminNavbar";
import bgImage from "../../assets/MAIN4.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation state
  const [isVisible, setIsVisible] = useState({
    hero: false,
    content: false,
    stats: false,
    charts: false,
    activity: false,
    orders: false,
  });

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (isAuthenticated === false) {
      navigate("/login");
    } else if (isAuthenticated && user?.role !== "Admin") {
      navigate("/home");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5143/api/admin/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "Admin") {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

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

  // Set hero section visible immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible((prev) => ({
        ...prev,
        hero: true,
        stats: true,
        charts: true,
        activity: true,
        orders: true,
      }));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-600";
      case "preparing":
        return "bg-blue-100 text-blue-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      case "ready":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusBarColor = (color) => {
    switch (color) {
      case "green":
        return "bg-green-400";
      case "blue":
        return "bg-blue-400";
      case "yellow":
        return "bg-yellow-400";
      case "red":
        return "bg-red-400";
      case "purple":
        return "bg-purple-400";
      default:
        return "bg-gray-400";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case "menu":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "user":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            ⚠️ Error loading dashboard
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return null;
  }

  const {
    stats,
    salesData,
    recentOrders,
    recentActivity,
    orderStatusDistribution,
  } = dashboardData;

  return (
    <div className="min-h-screen relative font-sans bg-white">
      <div className="absolute w-full z-50">
        <AdminNavigation />
      </div>

      {/* Hero Section */}
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
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Admin Dashboard
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Manage your restaurant operations and monitor performance
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="relative -mt-20 mb-12 px-4 sm:px-6 lg:px-8 z-40">
        <div
          className={`max-w-[1400px] mx-auto transition-all duration-1000 ease-out ${
            isVisible.stats
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          data-section="stats"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Sales */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm lg:text-base font-semibold mb-2">
                      Total Sales
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      ₱
                      {stats.totalSales.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={`text-xs lg:text-sm font-semibold ${
                        stats.monthlyGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.monthlyGrowth >= 0 ? "+" : ""}
                      {stats.monthlyGrowth.toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 lg:w-8 lg:h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm lg:text-base font-semibold mb-2">
                      Total Orders
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {stats.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-blue-600 text-xs lg:text-sm font-semibold">
                      All time
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm lg:text-base font-semibold mb-2">
                      Active Users
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {stats.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-purple-600 text-xs lg:text-sm font-semibold">
                      Registered
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Growth */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm lg:text-base font-semibold mb-2">
                      Revenue Growth
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {stats.monthlyGrowth >= 0 ? "+" : ""}
                      {stats.monthlyGrowth.toFixed(1)}%
                    </p>
                    <p className="text-yellow-600 text-xs lg:text-sm font-semibold">
                      vs last month
                    </p>
                  </div>
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Charts Section */}
          <div
            className={`grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 mb-10 transition-all duration-1000 ease-out ${
              isVisible.charts
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            data-section="charts"
          >
            {/* Sales Chart */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                Sales Overview (Last 7 Days)
              </h3>
              <div className="h-80 flex items-end justify-between space-x-3">
                {salesData && salesData.length > 0 ? (
                  salesData.map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 group"
                    >
                      <div
                        className="bg-yellow-400 rounded-t-lg w-full transition-all duration-1000 hover:bg-yellow-500 cursor-pointer relative"
                        style={{ height: `${data.percentage}%` }}
                        title={`₱${data.sales.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                      >
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          ₱
                          {data.sales.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 mt-3">
                        {data.day}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        ₱{(data.sales / 1000).toFixed(1)}k
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-500">
                    No sales data available
                  </div>
                )}
              </div>

              {/* Sales summary */}
              {salesData && salesData.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      This Week
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ₱
                      {salesData
                        .reduce((sum, data) => sum + data.sales, 0)
                        .toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Daily Avg
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ₱
                      {(
                        salesData.reduce((sum, data) => sum + data.sales, 0) /
                        salesData.length
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Best Day
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {
                        salesData.reduce((max, data) =>
                          data.sales > max.sales ? data : max
                        ).day
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Status Distribution - NOW DYNAMIC */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                Order Status Distribution
              </h3>
              <div className="space-y-6">
                {orderStatusDistribution &&
                orderStatusDistribution.length > 0 ? (
                  orderStatusDistribution.map((status, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-6 h-6 ${getStatusBarColor(
                              status.color
                            )} rounded-lg`}
                          ></div>
                          <span className="text-gray-700 font-medium text-lg">
                            {status.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 text-xl">
                            {status.percentage.toFixed(1)}%
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({status.count})
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${getStatusBarColor(
                            status.color
                          )} h-3 rounded-full transition-all duration-1000`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No order status data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity and Orders */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
            {/* Recent Activity */}
            <div
              className="bg-white rounded-2xl p-8 border border-gray-200"
              data-section="activity"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                Recent Activity
              </h3>
              <div className="space-y-6">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base">
                          {activity.action}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {activity.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div
              className="bg-white rounded-2xl p-8 border border-gray-200"
              data-section="orders"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold text-base transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-6">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-gray-900 text-base">
                            ORD-{order.orderId}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">
                          {order.customer || "Guest"}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {order.time}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900 text-lg">
                          ₱
                          {order.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No recent orders
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
