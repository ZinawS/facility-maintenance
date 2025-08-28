
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/**
 * ProtectedRoute component to secure routes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string[]} [props.allowedRoles=['client', 'admin']] - Roles allowed to access the route
 * @returns {JSX.Element} Protected route or redirect
 */
export const ProtectedRoute = ({ children, allowedRoles = ['client', 'admin'] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
