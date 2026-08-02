import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f9' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>Loading SMIS System...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if authorized for a different portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'cashier') return <Navigate to="/cashier" replace />;
    if (user.role === 'customer') return <Navigate to="/customer" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
