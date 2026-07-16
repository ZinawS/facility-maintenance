
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Spinner from '../components/UI/Spinner';

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
    return <Spinner size="lg" className="min-h-[60vh]" />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
