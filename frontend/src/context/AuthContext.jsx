import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

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

  // fetch user details from API
  const fetchUserDetails = async (userId, jwtToken) => {
    try {
      const res = await fetch(`http://localhost:5143/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user details");

      const data = await res.json();

      setUser((prevUser) => ({
        ...prevUser,
        phoneNumber: data.phoneNumber || null,
        address: data.address || null,
      }));
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const decoded = jwtDecode(savedToken);

        const baseUser = {
          userId: decoded?.userId, // <-- using userId
          email:
            decoded?.email || decoded?.unique_name || decoded?.name || null,
          role: decoded?.role || null,
          name: decoded?.name,
        };

        setUser(baseUser);

        if (baseUser.userId) {
          fetchUserDetails(baseUser.userId, savedToken);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);

      const baseUser = {
        userId: decoded?.userId, // <-- using userId
        email: decoded?.email || decoded?.unique_name || decoded?.name || null,
        role: decoded?.role || null,
        name: decoded?.name,
      };

      setUser(baseUser);

      if (baseUser.userId) {
        fetchUserDetails(baseUser.userId, jwtToken);
      }
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const value = {
    token,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
