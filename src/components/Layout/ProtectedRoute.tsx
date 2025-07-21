// src/components/Layout/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactElement;
  /** 어드민 전용으로 보호하려면 true */
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  // 1) 로그인 안 했으면 /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2) adminOnly 경로인데, isAdmin !== 1 이면 홈으로
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3) 정상 접근
  return children;
};
