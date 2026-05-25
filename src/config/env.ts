/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : env.ts
 * WHAT THIS FILE DOES : Centralizes environment flags for the admin portal
 * HOW IT DOES IT      : Reads Vite environment values in one place
 * DATA SOURCE         : import.meta.env from Vite
 * DATA DESTINATION    : Components and services that need environment flags
 * PRINCIPLE APPLIED   : DRY
 * ============================================================================
 */

export const ENV = {
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};
