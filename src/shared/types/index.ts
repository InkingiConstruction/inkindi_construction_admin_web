/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : index.ts
 * WHAT THIS FILE DOES : Defines shared domain types for the admin portal
 * HOW IT DOES IT      : Exports small TypeScript unions and interfaces
 * DATA SOURCE         : InkingiPro domain model
 * DATA DESTINATION    : Contexts, services, and feature components
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */

export type Role = 'ADMIN' | 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
