/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : index.ts
 * WHAT THIS FILE DOES : Exposes shared UI components used by the admin portal
 * HOW IT DOES IT      : Re-exports only components that remain in the admin app
 * DATA SOURCE         : Shared component files
 * DATA DESTINATION    : Feature imports across the admin portal
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */

export { default as Button } from './Button/Button';
export { default as Skeleton } from './Skeleton/Skeleton';
export { default as Input } from './Input/Input';
export { default as Label } from './Label/Label';
export { default as ProtectedRoute } from './ProtectedRoute';
