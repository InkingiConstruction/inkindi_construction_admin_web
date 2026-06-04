import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { api, mapBackendRole } from '../../../lib/api';
import type { Role, User } from '../../../shared/types';
import type { LoginPayload } from '../types/auth.types';

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

interface LoginResponse {
  token: string;
  user: BackendUser;
}

const mapUser = (backendUser: BackendUser): User => ({
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

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/api/v1/auth/login', {
        email: payload.email,
        password: payload.password,
      });

      const backendUser = response.data.user;
      const token = response.data.token;

      if (!backendUser) {
        throw new Error('Unable to load authenticated user.');
      }

      const user = mapUser(backendUser);

      if (user.role !== 'ADMIN') {
        throw new Error('This account is not allowed to access the admin portal.');
      }

      login(token, user);
      navigate('/dashboard');

      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    handleLogin,
    isLoading,
    error,
    clearError,
  };
};
