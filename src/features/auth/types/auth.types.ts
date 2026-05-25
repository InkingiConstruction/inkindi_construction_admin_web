/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : auth.types.ts
 * WHAT THIS FILE DOES : Defines TypeScript types for admin authentication
 * HOW IT DOES IT      : Exports small interfaces consumed by login helpers
 * DATA SOURCE         : User-entered login form values and mock auth service
 * DATA DESTINATION    : Auth hooks and context login function
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */

import type { User } from '../../../shared/types';

/**
 * Payload for the login API
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Response from Auth APIs (login/register)
 */
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  message: string;
  success: boolean;
}
