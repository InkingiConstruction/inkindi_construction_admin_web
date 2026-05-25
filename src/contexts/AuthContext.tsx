/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AuthContext.tsx
 * WHAT THIS FILE DOES : Provides shared admin portal state through React context
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../shared/types';
import { encrypt, decrypt } from '../shared/utils/encryption';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Initialize Auth: Check encrypted localStorage only in mock mode.
  useEffect(() => {
    const initAuth = async () => {
      const encryptedToken = localStorage.getItem('token');
      const encryptedUser = localStorage.getItem('user');

      if (encryptedToken && encryptedUser) {
        try {
          const decryptedToken = decrypt(encryptedToken);
          const decryptedUser = decrypt(encryptedUser);
          
          if (decryptedToken && decryptedUser) {
            const parsedUser = JSON.parse(decryptedUser);
            setToken(decryptedToken);
            setUser(parsedUser);
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    const encryptedUser = localStorage.getItem('user');
    if (encryptedUser) {
      const decryptedUser = decrypt(encryptedUser);
      if (decryptedUser) {
        setUser(JSON.parse(decryptedUser));
      }
    }
  };

  const login = (newToken: string, newUser: User) => {
    const encryptedToken = encrypt(newToken);
    const encryptedUser = encrypt(JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    
    localStorage.setItem('token', encryptedToken);
    localStorage.setItem('user', encryptedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token, 
      isLoading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
