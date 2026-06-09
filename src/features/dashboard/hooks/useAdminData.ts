/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : useAdminData.ts
 * WHAT THIS FILE DOES : Handles react-query logic for loading admin dashboard data
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility / Separation of Concerns)
 * ============================================================================
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardData } from '../../../data/adminApiService';

export const useAdminData = () => {
  const query = useQuery({
    queryKey: ['admin-dashboard-data'],
    queryFn: getAdminDashboardData,
  });

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error.message : '',
    isLoading: query.isLoading,
    refreshData: async () => {
      await query.refetch();
    },
  };
};
