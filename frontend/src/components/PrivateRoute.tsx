// src/components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react';

export default function PrivateRoute({
  children,
  allowedRoles
}: { children: JSX.Element; allowedRoles?: string[] }) {
  const { token, user } = useAuth();
  if (!token || (allowedRoles && !allowedRoles.includes(user?.role ?? ''))) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
