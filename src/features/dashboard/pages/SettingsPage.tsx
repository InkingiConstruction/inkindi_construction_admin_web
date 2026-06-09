/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SettingsPage.tsx
 * WHAT THIS FILE DOES : Renders administrative system settings and fee configurations
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { SectionHeader } from '../components/shared';
import { capabilities } from '../constants/capabilities';

export const SettingsPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();

  if (error) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Settings size={20} />}
        title="System Configuration"
        subtitle="Configure fees, rate limits, feature flags, maintenance mode, integrations, backups, and environment health."
        capabilities={capabilities.settings}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(data.systemSettings)
          .filter(([key]) => key !== 'attackProtections')
          .map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-bold uppercase text-gray-400">
                {key.replaceAll(/([A-Z])/g, ' $1')}
              </p>
              <p className="mt-1 font-semibold text-gray-900">{String(value)}</p>
            </div>
          ))}
      </div>

      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mb-2 text-amber-700" size={18} />
        These settings are loaded from the authenticated backend admin APIs.
      </div>
    </div>
  );
};

export default SettingsPage;
