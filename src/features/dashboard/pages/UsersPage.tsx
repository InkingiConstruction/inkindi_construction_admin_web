import React, { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatDate } from '../../../data/adminTypes';
import { api } from '../../../lib/api';
import {
  SectionHeader,
  DataTable,
  Badge,
  ActionsMenuButton,
  ActionsMenuPanel,
  DetailModal,
  Avatar,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

const userTooltips = {
  'User': 'Full name and system nickname / username.',
  'Contact': 'Registered email address and phone number.',
  'Role': 'Security group role permissions.',
  'KYC': 'Identity verification state.',
  'Status': 'Account access permission (Active or Suspended).',
};

export const UsersPage: React.FC = () => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuId: string,
    menuWidth = 320,
    estimatedHeight = 260
  ) => {
    event.stopPropagation();

    if (activeMenu === menuId) {
      setActiveMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
    );
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;
    const top = openBelow
      ? Math.min(rect.bottom + 8, window.innerHeight - estimatedHeight - 8)
      : Math.max(8, rect.top - estimatedHeight - 8);

    setMenuPosition({ top, left });
    setActiveMenu(menuId);
  };

  const closeMenu = () => setActiveMenu(null);

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

  const handleBatchSuspend = async (selectedUserIds: string[]) => {
    await runAdminAction(
      'batch-user-suspend',
      () =>
        Promise.all(
          selectedUserIds.map(userId =>
            api.put(`/api/v1/users/${userId}`, {
              banned: true,
              banReason: 'Suspended in batch from admin web',
              banExpires: null,
            })
          )
        ),
      'Selected users suspended successfully.'
    );
  };

  const handleBatchDelete = async (selectedUserIds: string[]) => {
    await runAdminAction(
      'batch-user-delete',
      () =>
        Promise.all(
          selectedUserIds.map(userId => api.delete(`/api/v1/users/${userId}`))
        ),
      'Selected users deleted successfully.'
    );
  };

  const createAdminNotification = (
    userId: string,
    title: string,
    body: string,
    dataPayload: Record<string, string>
  ) =>
    api.post('/api/v1/notifications', {
      userId,
      channel: 'in_app',
      title,
      body,
      data: dataPayload,
    });

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

  const rows = data.users.map(item => ({
    name: item.name,
    email: item.email,
    phone: item.phone,
    role: item.role,
    kyc: item.kycStatus,
    status: item.status,
    joined: formatDate(item.createdAt),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Users size={20} />}
        title="User Management"
        subtitle="Manage admins, clients, engineers, supervisors, and suppliers."
        capabilities={capabilities.users}
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
        title="All Users"
        headers={['User', 'Contact', 'Role', 'KYC', 'Status', 'Actions']}
        exportRowsData={rows}
        enableBatchSelect={true}
        rowIds={data.users.map(item => item.id)}
        batchActions={{
          onReject: handleBatchSuspend,
          onDelete: handleBatchDelete,
        }}
        tooltips={userTooltips}
        rows={data.users.map(item => [
          <div key={`user-col-${item.id}`} className="flex items-center gap-3">
            <Avatar name={item.name} src={item.avatar} type="user" />
            <div className="flex flex-col">
              <strong className="text-gray-900">{item.name}</strong>
              <span className="text-xs text-gray-500">@{item.username}</span>
            </div>
          </div>,
          <div key={`contact-${item.id}`}>
            <p>{item.email}</p>
            <p className="text-xs text-gray-500">{item.phone}</p>
          </div>,
          item.role,
          <Badge key={`kyc-${item.id}`} value={item.kycStatus} />,
          <Badge key={`status-${item.id}`} value={item.status} />,
          <div key={`actions-${item.id}`} className="relative flex justify-center">
            <ActionsMenuButton
              menuId={`user-${item.id}`}
              isOpen={activeMenu === `user-${item.id}`}
              onToggle={event => toggleMenu(event, `user-${item.id}`, 320, 260)}
            />
            <ActionsMenuPanel
              menuId={`user-${item.id}`}
              isOpen={activeMenu === `user-${item.id}`}
              position={menuPosition}
              onClose={closeMenu}
              widthClass="w-[320px] p-4"
            >
              <button
                onClick={() => {
                  closeMenu();
                  openDetail(
                    `User: ${item.name}`,
                    'Complete user profile snapshot from backend admin data.',
                    [
                      { label: 'Email', value: item.email },
                      { label: 'Phone', value: item.phone },
                      { label: 'Username', value: item.username },
                      { label: 'Role', value: item.role },
                      { label: 'KYC', value: <Badge value={item.kycStatus} /> },
                      { label: 'Status', value: <Badge value={item.status} /> },
                    ],
                    data.uploadedDocuments.filter(
                      document => document.uploadedBy === item.name
                    )
                  );
                }}
                className="mb-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left text-base font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                <span>View Profile</span>
              </button>

              <button
                disabled={actionBusy === `reset-${item.id}`}
                onClick={async () => {
                  await runAdminAction(
                    `reset-${item.id}`,
                    () =>
                      createAdminNotification(
                        item.id,
                        'Password reset requested',
                        'An admin requested that you reset your password.',
                        { type: 'password_reset_requested' }
                      ),
                    'Password reset request sent.'
                  );
                  closeMenu();
                }}
                className="mb-3 flex w-full items-center justify-between rounded-2xl bg-amber-100 px-5 py-4 text-left text-base font-bold text-amber-800 transition hover:bg-amber-200 disabled:opacity-50"
              >
                <span>Reset Password</span>
                {actionBusy === `reset-${item.id}` && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </button>

              <button
                disabled={actionBusy === `suspend-${item.id}`}
                onClick={async () => {
                  const shouldSuspend = item.status !== 'SUSPENDED';
                  await runAdminAction(
                    `suspend-${item.id}`,
                    () =>
                      api.put(`/api/v1/users/${item.id}`, {
                        banned: shouldSuspend,
                        banReason: shouldSuspend
                          ? 'Suspended from admin web'
                          : null,
                        banExpires: null,
                      }),
                    shouldSuspend
                      ? 'User suspended successfully.'
                      : 'User activated successfully.'
                  );
                  closeMenu();
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-base font-bold transition disabled:opacity-50 ${
                  item.status === 'SUSPENDED'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                <span>
                  {item.status === 'SUSPENDED'
                    ? 'Activate User'
                    : 'Suspend User'}
                </span>
                {actionBusy === `suspend-${item.id}` && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </button>
            </ActionsMenuPanel>
          </div>,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default UsersPage;
