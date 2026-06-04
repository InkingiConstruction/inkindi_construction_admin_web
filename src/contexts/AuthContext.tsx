/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Role, User } from '../shared/types';
import { api, mapBackendRole } from '../lib/api';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  username?: string | null;
  displayUsername?: string | null;
  phoneNumber?: string | null;
  image?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string | null, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapBackendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  username: backendUser.username || backendUser.displayUsername || '',
  phone: backendUser.phoneNumber || '',
  role: mapBackendRole(backendUser.role) as Role,
  avatar: backendUser.image || undefined,
  createdAt: backendUser.createdAt
    ? new Date(backendUser.createdAt).toISOString()
    : new Date().toISOString(),
  updatedAt: backendUser.updatedAt
    ? new Date(backendUser.updatedAt).toISOString()
    : new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('inkingi_admin_token');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const response = await api.get<BackendUser>('/api/v1/auth/me');
    setUser(mapBackendUser(response.data));
    setToken(storedToken);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string | null, newUser: User) => {
    if (newToken) {
      localStorage.setItem('inkingi_admin_token', newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    localStorage.removeItem('inkingi_admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(user),
        isLoading,
        refreshUser,
      }}
    >
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
