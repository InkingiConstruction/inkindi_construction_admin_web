/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AdminOperationsPage.tsx
 * WHAT THIS FILE DOES : Dispatches and renders individual admin pages
 * HOW IT DOES IT      : Switches on the `page` prop to load the standalone page module
 * DATA SOURCE         : Authenticated admin context
 * DATA DESTINATION    : React admin dashboard UI
 * PRINCIPLE APPLIED   : KISS / SOLID (Open/Closed Principle)
 * ============================================================================
 */

import React from 'react';
import type { PageKind } from '../types';
import {
  OverviewPage,
  KycPage,
  UsersPage,
  ProjectsPage,
  EscrowPage,
  DisputesPage,
  SupplyPage,
  InspectionsPage,
  ReportsPage,
  AuditPage,
  NotificationsPage,
  SettingsPage,
  ProfilePage,
} from './index';

interface AdminOperationsPageProps {
  page: PageKind;
}

export const AdminOperationsPage: React.FC<AdminOperationsPageProps> = ({
  page,
}) => {
  switch (page) {
    case 'overview':
      return <OverviewPage />;
    case 'kyc':
      return <KycPage />;
    case 'users':
      return <UsersPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'escrow':
      return <EscrowPage />;
    case 'disputes':
      return <DisputesPage />;
    case 'supply':
      return <SupplyPage />;
    case 'inspections':
      return <InspectionsPage />;
    case 'reports':
      return <ReportsPage />;
    case 'audit':
      return <AuditPage />;
    case 'notifications':
      return <NotificationsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'profile':
      return <ProfilePage />;
    default:
      return null;
  }
};

export default AdminOperationsPage;
