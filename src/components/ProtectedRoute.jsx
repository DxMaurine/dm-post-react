import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check for authorization
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    // Redirect to a default page if role is not authorized
    return <Navigate to="/pos" replace />;
  }

  return children;
};

export default ProtectedRoute;