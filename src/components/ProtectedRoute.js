import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 mx-auto rounded bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-3 w-24 mx-auto rounded bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && requireAuth) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
