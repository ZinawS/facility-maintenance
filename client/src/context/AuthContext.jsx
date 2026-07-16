import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

/**
 * Authentication context to manage user state globally
 */
export const AuthContext = createContext();

/**
 * AuthProvider component to wrap the app and provide auth context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (apiService.isAuthenticated()) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) setUser(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = (e) => {
      if (e.detail?.message === "User logged out" || e.detail?.message === "Token expired") {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};
