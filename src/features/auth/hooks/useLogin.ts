/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : useLogin.ts
 * WHAT THIS FILE DOES : Provides reusable admin portal hook logic
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { authenticateMockAdmin } from '../../../data/mockAdminService';
import type { LoginPayload } from '../types/auth.types';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await authenticateMockAdmin(payload.email, payload.password);
      
      login(token, user);
      navigate('/dashboard');
      
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
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
    clearError
  };
};
