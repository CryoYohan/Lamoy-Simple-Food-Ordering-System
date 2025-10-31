import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback, // From Code 2
} from "react";
import { jwtDecode } from "jwt-decode";
// 1. Import the new service function from Code 2
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

  // 2. Use the more robust logout function from Code 2
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  // 3. This is the merged fetchUserDetails function
  const fetchUserDetails = useCallback(async () => {
    try {
      // 3a. Use the working API call from Code 2
      const data = await getUserProfile();
      // data is the full UserDto: { userId, userName, email, fullName, address, phoneNumber, role, createdAt }

      // 3b. Use the SAFE update logic from Code 1
      // This merges the new data (address, phone) into the
      // existing state (prevUser) which already has the correct role from the token.
      setUser((prevUser) => ({
        ...prevUser,
        ...data,
        // As a safeguard, you can explicitly ensure the role from the token is kept
        // This line is optional if you trust prevUser, but good for safety:
        role: prevUser.role || data.role, 
      }));

    } catch (err) {
      console.error("Error fetching user details (token might be expired):", err);
      // 3c. Use the error handling from Code 2
      logout();
    }
  }, []); // No dependencies, logout is stable

  // 4. useEffect on load (Based on Code 1)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      try {
        const decoded = jwtDecode(savedToken);

        // 4a. Set baseUser immediately (the "Code 1" way for routing)
        const baseUser = {
          userId: decoded?.userId,
          email:
            decoded?.email || decoded?.unique_name || decoded?.name || null,
          role: decoded?.role || null, // This is the crucial part for routing
          name: decoded?.name,
        };

        setUser(baseUser); // <-- This sets the role immediately

        // 4b. Then, fetch the rest of the profile data
        if (baseUser.userId) {
          fetchUserDetails(); // Call the new merged function
        }
      } catch (err) {
        console.error("Invalid token on load:", err);
        logout(); // Clear bad token
      }
    }
    setIsLoading(false);
  }, [fetchUserDetails]); // Add fetchUserDetails dependency

  // 5. login function (Based on Code 1)
  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);

      // 5a. Set baseUser immediately (the "Code 1" way for routing)
      const baseUser = {
        userId: decoded?.userId,
        email: decoded?.email || decoded?.unique_name || decoded?.name || null,
        role: decoded?.role || null, // This is the crucial part for routing
        name: decoded?.name,
      };

      setUser(baseUser); // <-- This sets the role immediately

      // 5b. Then, fetch the rest of the profile data
      if (baseUser.userId) {
        fetchUserDetails(); // Call the new merged function
      }
    } catch (err) {
      console.error("Failed to decode token on login:", err);
    }
  };

  const value = {
    token,
    user,
    setUser, // Expose setUser for profile updates (from Code 2)
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};