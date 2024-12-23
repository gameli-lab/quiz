import React, { createContext, useState, useEffect } from "react";

// Create the context
export const AuthContext = createContext();

// Provide the context to the app
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user token exists in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Set to true if token exists
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
