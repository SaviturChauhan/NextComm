import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;







