import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token && apiService.isAuthenticated()) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            name: decoded.email.split("@")[0],
            email: decoded.email,
            role: decoded.role,
          });
        } catch (err) {
          console.error("Error decoding token:", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = (e) => {
      if (
        e.detail?.message === "User logged out" ||
        e.detail?.message === "Token expired"
      ) {
        setUser(null);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
