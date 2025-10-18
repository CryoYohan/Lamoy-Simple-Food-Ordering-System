import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/dynamicNavbar";
import bgImage from "../assets/MAIN4.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const WelcomeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    form: false,
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

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
    setIsVisible((prev) => ({ ...prev, hero: true }));
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation - Replace all alert() calls
    if (!email.trim()) {
      showError("Email Required: Please enter your email address to sign in.");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      showError("Password Required: Please enter your password to sign in.");
      setIsLoading(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Invalid Email Format: Please enter a valid email address (example: user@example.com).");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5143/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Save role and token
        login(data.token);
        localStorage.setItem("role", data.role); // store user role locally
        localStorage.setItem("username", data.userName);

        showSuccess(`Welcome back, ${data.userName}!`);

        // Role-based navigation
        setTimeout(() => {
          if (data.role === 1) {
            navigate("/admin");
          } else {
            navigate("/home");
          }
        }, 1000);
      }
      else {
        const status = response.status;
        let message = "We encountered an issue while signing you in. Please try again.";

        if (status === 401 || status === 400) {
          message = "Invalid Credentials: The email or password you entered is incorrect.";
        } else if (status === 404) {
          message = "Account Not Found: No account found with this email address.";
        } else if (status >= 500) {
          message = "Server Error: Our servers are experiencing issues. Please try again in a few minutes.";
        }

        showError(message);
      }
    } catch (err) {
      showError("Connection Error: We're having trouble connecting to our servers. Please check your internet connection and try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Upper half with background image */}
      <div
        className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      {/* Lower half with white background */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white" />

      <div className="absolute w-full z-50">
        <DynamicNavigation />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          className={`text-center mb-8 sm:mb-12 mt-8 sm:mt-12 transition-all duration-1000 ${isVisible.hero
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
            }`}
          data-section="hero"
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Welcome Back!
          </h1>
          <p className="text-white/90 text-lg sm:text-xl md:text-2xl px-4 max-w-md sm:max-w-none mx-auto">
            Access your account and enjoy your favorite
            <span className="hidden sm:inline">
              <br />
            </span>
            <span className="sm:hidden"> </span>
            Filipino meals anytime.
          </p>
        </div>

        <div
          className={`w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-1000 ${isVisible.form
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
            }`}
          data-section="form"
          style={{ transitionDelay: "300ms" }}
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-8 sm:mb-10 text-center">
              Sign In to <span className="text-yellow-500">Lamoy</span>
            </h2>

            <form onSubmit={handleSignIn} className="space-y-5 sm:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm text-yellow-500 hover:text-yellow-600 transition-colors font-medium"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
                Don't have an Account?{" "}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-yellow-500 hover:text-yellow-600 font-semibold hover:underline transition-all"
                  disabled={isLoading}
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