/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : index.ts
 * WHAT THIS FILE DOES : Exposes the admin login feature public API
 * HOW IT DOES IT      : Re-exports only the login page, login hook, and auth types
 * DATA SOURCE         : Auth feature modules
 * DATA DESTINATION    : App route imports
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */

export { default as LoginPage } from './pages/LoginPage';

export * from './hooks/useLogin';

export type * from './types/auth.types';
