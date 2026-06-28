import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectRole } from '../store/slices/authSlice';

const RoleGuard = ({ allowedRoles, children }) => {
  const role = useSelector(selectRole);
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default RoleGuard;
