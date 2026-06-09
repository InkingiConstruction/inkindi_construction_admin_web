/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : capabilities.ts
 * WHAT THIS FILE DOES : Exports page-specific capabilities and features listings
 * PRINCIPLE APPLIED   : SOLID (Open/Closed Principle)
 * ============================================================================
 */

import type { PageKind } from '../types';

export const capabilities: Record<PageKind, string[]> = {
  overview: [
    'View dashboard KPIs',
    'Track platform growth',
    'Monitor escrow exposure',
    'See urgent operational queues',
    'Export operational snapshots',
    'Review admin-only access state',
  ],
  kyc: [
    'View pending KYC submissions',
    'Preview identity documents',
    'Approve or reject applications',
    'Request additional documents',
    'Verify IER licenses',
    'Export KYC compliance report',
  ],
  users: [
    'View all users',
    'Search by role or status',
    'Suspend and activate accounts',
    'Change roles',
    'Force password reset',
    'Export user list',
  ],
  projects: [
    'View all projects',
    'Override project status',
    'View audit trail',
    'Track contractor metrics',
    'View Gantt timeline',
    'Access project photos and documents',
  ],
  escrow: [
    'View total escrow balance',
    'View project balances',
    'Run reconciliation',
    'Manual emergency override',
    'Configure platform fees',
    'Monitor MTN and Airtel health',
  ],
  disputes: [
    'View open disputes',
    'Filter by priority',
    'Review evidence',
    'Issue resolution decisions',
    'Release locked funds',
    'Export dispute analytics',
  ],
  supply: [
    'View RFQs',
    'View supplier quotes',
    'Monitor purchase orders',
    'Track deliveries',
    'Verify GPS delivery',
    'Review supplier ratings',
  ],
  inspections: [
    'View inspection reports',
    'Review checklists',
    'Access photos and signatures',
    'Monitor completion rates',
    'Track quality ratings',
    'Verify GPS check-ins',
  ],
  reports: [
    'Generate compliance reports',
    'Generate financial reports',
    'Generate supplier reports',
    'View revenue reports',
    'Export audit logs',
    'Schedule automated reports',
  ],
  audit: [
    'View complete audit log',
    'Search by user/action/entity',
    'Export logs',
    'Verify tamper chain',
    'View security events',
    'Monitor API key usage',
  ],
  notifications: [
    'Send broadcasts',
    'Target users by role',
    'Edit email templates',
    'View queue status',
    'Track delivery logs',
    'Resend failed notifications',
  ],
  settings: [
    'Edit JSONB settings',
    'Configure fees',
    'Manage feature flags',
    'Trigger backups',
    'Monitor environment health',
    'Set maintenance mode',
  ],
  profile: [
    'Secure admin profile',
    'Enable TOTP 2FA',
    'Update profile details',
    'Change password',
    'View own audit trail',
  ],
};
