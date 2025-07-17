// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 이메일·비밀번호 회원가입
  const signUp = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth as Auth, email, password);
    return cred.user;
  };

  // 이메일·비밀번호 로그인
  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth as Auth, email, password);
    return cred.user;
  };

  // 로그아웃
  const signOut = () => firebaseSignOut(auth as Auth);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {/* 로딩 중 화면 처리 */}
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

// Context 사용을 편하게 해주는 커스텀 훅
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
