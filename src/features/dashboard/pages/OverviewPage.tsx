/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : OverviewPage.tsx
 * WHAT THIS FILE DOES : Renders administrative overview KPIs and priority operations table
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useMemo } from 'react';
import {
  Users,
  ClipboardCheck,
  Briefcase,
  Landmark,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatRwf } from '../../../data/adminTypes';
import {
  StatTile,
  DataTable,
  Badge,
  SectionHeader,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';

export const OverviewPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      escrowTotal: data.projects.reduce(
        (total, item) => total + item.escrowBalance,
        0
      ),
      pendingKyc: data.kycDocuments.filter(item => item.status === 'PENDING')
        .length,
      activeProjects: data.projects.filter(item => item.status !== 'COMPLETED')
        .length,
      unreadNotifications: data.notifications.filter(item => !item.read).length,
    };
  }, [data]);

  const priorityRows = useMemo(() => {
    if (!data) return [];

    return [
      ...data.kycDocuments
        .filter(item => item.status === 'PENDING')
        .slice(0, 2)
        .map(item => ({
          area: 'KYC',
          item: `${item.userName} - ${item.documentType}`,
          status: item.status,
          owner: item.role,
        })),
      ...data.transactions
        .filter(item => !['COMPLETED', 'PAID', 'RELEASED'].includes(item.status))
        .slice(0, 2)
        .map(item => ({
          area: 'Escrow',
          item: `${item.type.replaceAll('_', ' ')} - ${item.project}`,
          status: item.status,
          owner: item.party,
        })),
      ...data.disputes
        .filter(item => !item.status.includes('RESOLVED'))
        .slice(0, 2)
        .map(item => ({
          area: 'Dispute',
          item: item.summary || item.category,
          status: item.status,
          owner: item.openedBy,
        })),
    ].slice(0, 6);
  }, [data]);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (isLoading || !data || !stats) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<ShieldCheck size={20} />}
        title="Overview"
        subtitle="Manage Projects Operations and users."
        capabilities={capabilities.overview}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile
          label="Users"
          value={data.users.length}
          icon={<Users size={18} />}
        />
        <StatTile
          label="Pending KYC"
          value={stats.pendingKyc}
          icon={<ClipboardCheck size={18} />}
        />
        <StatTile
          label="Projects"
          value={stats.activeProjects}
          icon={<Briefcase size={18} />}
        />
        <StatTile
          label="Escrow"
          value={formatRwf(stats.escrowTotal)}
          icon={<Landmark size={18} />}
        />
        <StatTile
          label="Unread Alerts"
          value={stats.unreadNotifications}
          icon={<Bell size={18} />}
        />
      </div>
      <DataTable
        title="Priority Operations"
        headers={['Area', 'Item', 'Status', 'Owner']}
        exportRowsData={priorityRows}
        rows={priorityRows.map(item => [
          item.area,
          item.item,
          <Badge value={item.status} />,
          item.owner,
        ])}
      />
    </div>
  );
};

export default OverviewPage;
