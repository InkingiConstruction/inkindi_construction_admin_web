/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ProtectedRoute.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, backend data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from './index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * A wrapper component for routes that require authentication.
 * It also supports role-based access control.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // While checking persistence, show a loading state to prevent flashing
  if (isLoading) {
    return (
      <div className="container mx-auto p-12 space-y-8 animate-pulse">
        <Skeleton height={40} width="40%" />
        <Skeleton height={200} className="rounded-3xl" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton height={150} />
          <Skeleton height={150} />
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-based access is required, the restored profile must include an allowed user role.
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
