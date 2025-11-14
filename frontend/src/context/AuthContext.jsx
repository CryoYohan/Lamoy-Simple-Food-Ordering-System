import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../services/authService";

const AuthContext = createContext();

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  }, []);

  // Fetch Profile
  const fetchUserDetails = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setUser((prev) => ({
        ...prev,
        ...data,
        role: prev?.role || data.role,
      }));
    } catch (err) {
      console.error("Error fetching user details:", err);
      logout();
    }
  }, [logout]);

  // Load from localStorage on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);

      try {
        const decoded = jwtDecode(savedToken);
        const baseUser = {
          userId: decoded?.userId,
          email: decoded?.email || decoded?.unique_name || decoded?.name,
          role: decoded?.role || null,
          name: decoded?.name,
        };

        setUser(baseUser);

        if (baseUser.userId) {
          fetchUserDetails();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }

    setIsLoading(false);
  }, [fetchUserDetails, logout]);

  // Login
  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);
      const baseUser = {
        userId: decoded?.userId,
        email: decoded?.email || decoded?.unique_name || decoded?.name,
        role: decoded?.role || null,
        name: decoded?.name,
      };

      setUser(baseUser);

      if (baseUser.userId) {
        fetchUserDetails();
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  };

  const value = {
    token,
    user,
    setUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
