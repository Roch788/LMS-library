import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import { protectedRouteStyles as s } from '../assets/dummyStyles';

const ProtectedRoute = ({ children, allowedRole = null }) => {
  const { currentUser, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingCard}>
          Loading library account...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    const redirectPath = currentUser.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
