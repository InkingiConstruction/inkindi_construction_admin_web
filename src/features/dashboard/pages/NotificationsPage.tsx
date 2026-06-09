/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : NotificationsPage.tsx
 * WHAT THIS FILE DOES : Renders notification queues and handles message resends
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatDate } from '../../../data/adminTypes';
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

export const NotificationsPage: React.FC = () => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

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

  const rows = data.notifications.map(item => ({
    title: item.title,
    body: item.body,
    type: item.type,
    read: item.read,
    timestamp: formatDate(item.timestamp),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Bell size={20} />}
        title="Notification Management"
        subtitle="Broadcast, target by role, edit templates, monitor queue status, and resend failures."
        capabilities={capabilities.notifications}
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
        title="Notification Queue"
        headers={['Title', 'Body', 'Type', 'State', 'Action']}
        exportRowsData={rows}
        rows={data.notifications.map(item => [
          <strong key={`title-${item.id}`}>{item.title}</strong>,
          item.body,
          item.type,
          item.read ? (
            <Badge key={`badge-cmp-${item.id}`} value="COMPLETED" />
          ) : (
            <Badge key={`badge-pend-${item.id}`} value="PENDING" />
          ),
          <div key={`actions-${item.id}`} className="flex flex-wrap gap-2">
            <ViewButton
              onClick={() =>
                openDetail(
                  `Notification: ${item.title}`,
                  item.body,
                  [
                    { label: 'Type', value: item.type },
                    { label: 'Read', value: item.read ? 'Yes' : 'No' },
                    { label: 'Timestamp', value: formatDate(item.timestamp) },
                    { label: 'Route', value: item.link },
                  ],
                  []
                )
              }
            />
            <button
              disabled={actionBusy === `resend-${item.id}`}
              onClick={() =>
                runAdminAction(
                  `resend-${item.id}`,
                  async () => {
                    if (!item.userId) {
                      throw new Error('Notification has no user to resend to');
                    }
                    return api.post('/api/v1/notifications', {
                      userId: item.userId,
                      channel: item.channel || item.type || 'in_app',
                      title: item.title,
                      body: item.body,
                      data: { resendOf: item.id, type: 'notification_resend' },
                    });
                  },
                  'Notification resent successfully.'
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-gray-50"
            >
              Resend
              {actionBusy === `resend-${item.id}` && (
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

export default NotificationsPage;
