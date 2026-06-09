/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : DisputesPage.tsx
 * WHAT THIS FILE DOES : Renders and manages disputes and releases locked escrow
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatRwf, formatDate } from '../../../data/adminTypes';
import { api } from '../../../lib/api';
import {
  SectionHeader,
  DataTable,
  Badge,
  ViewButton,
  DetailModal,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const DisputesPage: React.FC = () => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const getDocuments = (entityType: string, entityId: string) => {
    if (!data) return [];
    return data.uploadedDocuments.filter(
      document =>
        document.entityType === entityType && document.entityId === entityId
    );
  };

  const openDetail = (
    title: string,
    subtitle: string,
    fields: { label: string; value: React.ReactNode }[],
    documents: any[]
  ) => {
    setDetail({ title, subtitle, fields, documents });
  };

  const runAdminAction = async (
    key: string,
    action: () => Promise<unknown>,
    success: string
  ) => {
    setActionBusy(key);
    setActionError('');
    setActionMessage('');

    try {
      await action();
      setActionMessage(success);
      await refreshData();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'Action failed'
      );
    } finally {
      setActionBusy('');
    }
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

  const rows = data.disputes.map(item => ({
    id: item.id,
    project: item.project,
    category: item.category,
    openedBy: item.openedBy,
    lockedAmount: item.lockedAmount,
    status: item.status,
    summary: item.summary,
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Scale size={20} />}
        title="Dispute Management"
        subtitle="Mediate disputes, review evidence, handle appeals, and release locked escrow based on decisions."
        capabilities={capabilities.disputes}
      />
      {actionError && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {actionMessage}
        </div>
      )}

      <DataTable
        title="Dispute Cases"
        headers={[
          'Case',
          'Project',
          'Category',
          'Opened By',
          'Locked',
          'Status',
          'Decision',
        ]}
        exportRowsData={rows}
        rows={data.disputes.map(item => [
          item.id,
          item.project,
          item.category,
          item.openedBy,
          formatRwf(item.lockedAmount),
          <Badge key={`status-${item.id}`} value={item.status} />,
          <div key={`decision-${item.id}`} className="flex flex-wrap gap-2">
            <ViewButton
              label="Evidence"
              onClick={() =>
                openDetail(
                  `Dispute: ${item.id}`,
                  item.summary,
                  [
                    { label: 'Project', value: item.project },
                    { label: 'Category', value: item.category },
                    { label: 'Opened by', value: item.openedBy },
                    { label: 'Locked amount', value: formatRwf(item.lockedAmount) },
                    { label: 'Status', value: <Badge value={item.status} /> },
                    { label: 'Created', value: formatDate(item.createdAt) },
                  ],
                  getDocuments('dispute', item.id)
                )
              }
            />
            <button
              disabled={actionBusy === `resolve-${item.id}`}
              onClick={() =>
                runAdminAction(
                  `resolve-${item.id}`,
                  () =>
                    api.put(`/api/v1/disputes/${item.id}`, {
                      status: 'resolved_partial',
                      resolution: { note: 'Resolved from admin web' },
                    }),
                  'Dispute resolved successfully.'
                )
              }
              className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
            >
              Resolve
              {actionBusy === `resolve-${item.id}` && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
            </button>
          </div>,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default DisputesPage;
