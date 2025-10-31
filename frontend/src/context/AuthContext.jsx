import React, { createContext, useContext, useState, useEffect, useCallback } from "react"; // Added useCallback
import { jwtDecode } from "jwt-decode";
// 1. Import the new service function
import { getUserProfile } from "../services/authService"; // Adjust path as needed

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Define logout first (as fetchUserDetails might call it)
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    // Also clear the role/username set by the login page
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  // 3. fetchUserDetails now uses the secure /api/user/profile endpoint
  const fetchUserDetails = useCallback(async (baseUser) => {
    try {
      // This function gets the token from storage and calls GET /api/user/profile
      const data = await getUserProfile();
      // data is the full UserDto: { userId, userName, email, fullName, address, phoneNumber, role, createdAt }

      // Merge the baseUser (with immediate role/name from token)
      // with the full data (address/phone) from the API call
      setUser({
        ...baseUser,
        ...data,
      });

    } catch (err) {
      console.error("Error fetching user details (token might be expired):", err);
      // If fetching the profile fails, the token is invalid or expired. Log out.
      logout();
    }
  }, []); // No dependencies, logout is stable

  // 4. useEffect on load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const decoded = jwtDecode(savedToken);

        const baseUser = {
          userId: decoded?.userId,
          email: decoded?.email || decoded?.unique_name || decoded?.name || null,
          role: decoded?.role || null,
          name: decoded?.name,
          // Add all fields from DTO to ensure they exist, even if null
          fullName: decoded?.name || '',
          phoneNumber: null,
          address: null,
        };

        setUser(baseUser); // Set immediate base data

        if (baseUser.userId) {
          fetchUserDetails(baseUser); // Fetch full details (address/phone)
        }
      } catch (err) {
        console.error("Invalid token on load:", err);
        logout(); // Clear bad token
      }
    }
    setIsLoading(false);
  }, [fetchUserDetails]); // Add fetchUserDetails as dependency

  // 5. login function
  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken); // This is the key line

    try {
      const decoded = jwtDecode(jwtToken);

      const baseUser = {
        userId: decoded?.userId,
        email: decoded?.email || decoded?.unique_name || decoded?.name || null,
        role: decoded?.role || null,
        name: decoded?.name,
        // Add all fields from DTO to ensure they exist, even if null
        fullName: decoded?.name || '',
        phoneNumber: null,
        address: null,
      };

      setUser(baseUser); // Set immediate base data

      if (baseUser.userId) {
        fetchUserDetails(baseUser); // Fetch full details (address/phone)
      }
    } catch (err) {
      console.error("Failed to decode token on login:", err);
    }
  };

  const value = {
    token,
    user,
    setUser, // Expose setUser for profile updates
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
