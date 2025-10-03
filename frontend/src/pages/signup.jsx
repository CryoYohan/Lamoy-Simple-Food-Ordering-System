import React, { useState, useEffect } from "react";
import DynamicNavigation from "../components/dynamicNavbar";
import bgImage from "../assets/MAIN4.png";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    fullName: "",
    address: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    form: false,
  });
  const navigate = useNavigate();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
      errors.push("at least 6 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("at least one number");
    }

    return errors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (!formData.userName.trim()) {
      alert(
        "Username Required: Please enter a username to create your account."
      );
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      alert("Email Required: Please enter your email address.");
      setIsLoading(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(
        "Invalid Email Format: Please enter a valid email address (example: user@example.com)."
      );
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert(
        "Password Mismatch: The passwords you entered do not match. Please make sure both password fields are identical."
      );
      setIsLoading(false);
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      const errorMessage = `Password Requirements Not Met: Your password must include: ${passwordErrors.join(
        ", "
      )}. Please create a stronger password for better security.`;
      alert(errorMessage);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5143/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        }),
      });

      if (response.ok) {
        // Show success alert
        alert(
          `Account Created! Welcome to Lamoy, ${formData.userName}! You can now sign in.`
        );

        // Navigate to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        const errorText = await response.text();
        alert(
          `Account Creation Failed: ${
            errorText ||
            "We encountered an issue while creating your account. Please check your information and try again."
          }`
        );
      }
    } catch (err) {
      alert(
        "Connection Error: We're having trouble connecting to our servers. Please check your internet connection and try again."
      );
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInRedirect = () => {
    navigate("/login");
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
          className={`text-center mb-8 sm:mb-12 mt-8 sm:mt-12 transition-all duration-1000 ${
            isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          data-section="hero"
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Join Lamoy!
          </h1>
          <p className="text-white/90 text-lg sm:text-xl md:text-2xl px-4 max-w-md sm:max-w-none mx-auto">
            Create your account and start enjoying
            <span className="hidden sm:inline">
              <br />
            </span>
            <span className="sm:hidden"> </span>
            delicious Filipino meals today.
          </p>
        </div>

        <div
          className={`w-full max-w-xs sm:max-w-lg md:max-w-2xl bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-1000 ${
            isVisible.form
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          data-section="form"
          style={{ transitionDelay: "300ms" }}
        >
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-8 sm:mb-10 text-center">
              Sign Up to <span className="text-yellow-500">Lamoy</span>
            </h2>

            <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
              {/* Username and Full Name - responsive columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password and Confirm Password - responsive columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                    required
                    minLength="6"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 outline-none transition-all duration-200 bg-gray-50 text-gray-700 resize-none text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
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
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
                Already have an Account?{" "}
                <button
                  type="button"
                  onClick={handleSignInRedirect}
                  className="text-yellow-500 hover:text-yellow-600 font-semibold hover:underline transition-all"
                  disabled={isLoading}
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

export default SignUpPage;