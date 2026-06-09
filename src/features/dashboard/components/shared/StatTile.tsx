/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : StatTile.tsx
 * WHAT THIS FILE DOES : Renders a dashboard KPI stat tile card
 * PRINCIPLE APPLIED   : Single Responsibility
 * ============================================================================
 */

import React from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, icon }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-brand">
      {icon}
    </div>
    <p className="text-xl font-black text-gray-900 md:text-2xl">{value}</p>
    <p className="mt-1 text-xs font-semibold text-gray-500">{label}</p>
  </div>
);

export default StatTile;
