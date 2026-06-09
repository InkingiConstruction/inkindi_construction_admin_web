/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AuditPage.tsx
 * WHAT THIS FILE DOES : Renders system audit logs and security event trackers
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatDate } from '../../../data/adminTypes';
import {
  SectionHeader,
  DataTable,
  Badge,
  ViewButton,
  DetailModal,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const AuditPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);

  const openDetail = (
    title: string,
    subtitle: string,
    fields: { label: string; value: React.ReactNode }[],
    documents: any[]
  ) => {
    setDetail({ title, subtitle, fields, documents });
  };

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

  const auditRows = data.auditLogs.map(item => ({
    actor: item.actor,
    action: item.action,
    target: item.target,
    severity: item.severity,
    date: formatDate(item.createdAt),
  }));

  const securityRows = data.securityEvents.map(item => ({
    ...item,
    createdAt: formatDate(item.createdAt),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<ScrollText size={20} />}
        title="Audit & Compliance"
        subtitle="Search audit logs, security events, API usage, and tamper-chain verification."
        capabilities={capabilities.audit}
      />

      <DataTable
        title="System Audit Log"
        headers={['Actor', 'Action', 'Target', 'Severity', 'Action']}
        exportRowsData={auditRows}
        rows={data.auditLogs.map(item => [
          item.actor,
          item.action.replaceAll('_', ' '),
          item.target,
          <Badge key={`audit-badge-${item.id}`} value={item.severity} />,
          <ViewButton
            key={`audit-view-${item.id}`}
            onClick={() =>
              openDetail(
                `Audit: ${item.id}`,
                'Compliance event details from the backend audit trail.',
                [
                  { label: 'Actor', value: item.actor },
                  { label: 'Action', value: item.action.replaceAll('_', ' ') },
                  { label: 'Target', value: item.target },
                  { label: 'Severity', value: <Badge value={item.severity} /> },
                  { label: 'Date', value: formatDate(item.createdAt) },
                  { label: 'Record source', value: 'Backend audit log' },
                ],
                []
              )
            }
          />,
        ])}
      />

      <DataTable
        title="Security Events"
        headers={['Event', 'Actor', 'Severity', 'IP', 'Action']}
        exportRowsData={securityRows}
        rows={data.securityEvents.map(item => [
          item.event.replaceAll('_', ' '),
          item.actor,
          <Badge key={`sec-badge-${item.id}`} value={item.severity} />,
          item.ip,
          <ViewButton
            key={`sec-view-${item.id}`}
            onClick={() =>
              openDetail(
                `Security event: ${item.id}`,
                'Security event details for compliance review.',
                [
                  { label: 'Event', value: item.event.replaceAll('_', ' ') },
                  { label: 'Actor', value: item.actor },
                  { label: 'Severity', value: <Badge value={item.severity} /> },
                  { label: 'IP address', value: item.ip },
                  { label: 'Created', value: formatDate(item.createdAt) },
                  { label: 'Status', value: 'Loaded from backend security events' },
                ],
                []
              )
            }
          />,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default AuditPage;
