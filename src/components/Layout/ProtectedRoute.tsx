// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return children;
};
