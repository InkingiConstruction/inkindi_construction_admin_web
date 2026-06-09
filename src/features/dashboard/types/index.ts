/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : index.ts (Dashboard Types)
 * WHAT THIS FILE DOES : Declares types and interfaces for the admin dashboard pages
 * HOW IT DOES IT      : Focuses on domain-specific interfaces and type safety
 * DATA SOURCE         : Domain logic and component state contracts
 * PRINCIPLE APPLIED   : SOLID (Interface Segregation / Single Responsibility)
 * ============================================================================
 */

import React from 'react';
import type { UploadedDocumentRecord } from '../../../data/adminTypes';

export type PageKind =
  | 'overview'
  | 'kyc'
  | 'users'
  | 'projects'
  | 'escrow'
  | 'disputes'
  | 'supply'
  | 'inspections'
  | 'reports'
  | 'audit'
  | 'notifications'
  | 'settings'
  | 'profile';

export type Row = Record<string, string | number | boolean>;

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

export type DetailModalState = {
  title: string;
  subtitle: string;
  fields: DetailField[];
  documents: UploadedDocumentRecord[];
} | null;

export interface ProfileFormState {
  name: string;
  username: string;
  phone: string;
  avatar: string;
}

export interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
