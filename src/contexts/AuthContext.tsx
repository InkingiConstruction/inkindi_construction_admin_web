/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Role, User } from '../shared/types';
import { authClient } from '../lib/auth-client';
import { mapBackendRole } from '../lib/api';

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
    const session = await authClient.getSession();
    const sessionUser = session.data?.user as BackendUser | undefined;

    if (!sessionUser) {
      setUser(null);
      setToken(null);
      return;
    }

    setUser(mapBackendUser(sessionUser));
    setToken(session.data?.session?.token || 'cookie-session');
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
    setToken(newToken || 'cookie-session');
    setUser(newUser);
  };

  const logout = async () => {
    await authClient.signOut();
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
