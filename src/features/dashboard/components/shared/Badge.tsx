/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : Badge.tsx
 * WHAT THIS FILE DOES : Renders administrative status/risk badge indicators
 * PRINCIPLE APPLIED   : Single Responsibility
 * ============================================================================
 */

import React from 'react';

const statusClass = (status: string) => {
  if (
    [
      'APPROVED',
      'ACTIVE',
      'COMPLETED',
      'INFO',
      'VERIFIED',
      'SELECTED',
      'SUBMITTED',
      'CAPTURED',
    ].includes(status)
  ) {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (
    [
      'PENDING',
      'UNDER_REVIEW',
      'MILESTONE_REVIEW',
      'WARNING',
      'MEDIATION',
      'IN_TRANSIT',
      'SCHEDULED',
      'PENDING_SIGNATURE',
      'OPEN',
    ].includes(status)
  ) {
    return 'bg-amber-50 text-amber-700';
  }
  if (['REJECTED', 'SUSPENDED', 'HIGH', 'CRITICAL', 'FAILED'].includes(status)) {
    return 'bg-rose-50 text-rose-700';
  }
  return 'bg-gray-100 text-gray-700';
};

export const Badge: React.FC<{ value: string }> = ({ value }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(
      value
    )}`}
  >
    {value.replaceAll('_', ' ')}
  </span>
);
export default Badge;
