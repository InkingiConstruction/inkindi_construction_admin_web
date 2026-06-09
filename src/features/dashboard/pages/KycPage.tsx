import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatDate } from '../../../data/adminTypes';
import { api } from '../../../lib/api';
import {
  SectionHeader,
  DataTable,
  Badge,
  ViewButton,
  ActionsMenuButton,
  ActionsMenuPanel,
  ActionMenuItem,
  DetailModal,
  Avatar,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

const kycTooltips = {
  'Applicant': 'The user applying for identity verification.',
  'Risk': 'System calculated threat level based on database history.',
  'Status': 'Current state of KYC review.',
  'KYC Review Queue': 'Outstanding KYC requests awaiting verification.',
};

export const KycPage: React.FC = () => {
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
    menuWidth = 224,
    estimatedHeight = 180
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

  const handleBatchApprove = async (selectedDocIds: string[]) => {
    await runAdminAction(
      'batch-kyc-approve',
      () =>
        Promise.all(
          selectedDocIds.map(docId => {
            const doc = data?.kycDocuments.find(d => d.id === docId);
            if (!doc) return Promise.resolve();
            return api.post(`/api/v1/kyc/${doc.userId}/approve`, {
              reviewNote: 'Approved in batch from admin web',
            });
          })
        ),
      'Selected KYC requests approved successfully.'
    );
  };

  const handleBatchReject = async (selectedDocIds: string[]) => {
    await runAdminAction(
      'batch-kyc-reject',
      () =>
        Promise.all(
          selectedDocIds.map(docId => {
            const doc = data?.kycDocuments.find(d => d.id === docId);
            if (!doc) return Promise.resolve();
            return api.post(`/api/v1/kyc/${doc.userId}/reject`, {
              reason: 'Rejected in batch from admin web review',
              documentIds: [docId],
            });
          })
        ),
      'Selected KYC requests rejected successfully.'
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

  const rows = data.kycDocuments.map(item => ({
    applicant: item.userName,
    role: item.role,
    document: item.documentType,
    risk: item.risk,
    status: item.status,
    submitted: formatDate(item.submittedAt),
    expires: formatDate(item.expiresAt),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<ClipboardCheck size={20} />}
        title="KYC & Identity Verification"
        subtitle="Review identity files, professional licenses, certificates, expiry risk, and compliance evidence."
        capabilities={capabilities.kyc}
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
        title="KYC Review Queue"
        headers={[
          'Applicant',
          'Role',
          'Document',
          'Risk',
          'Status',
          'Submitted',
          'Actions',
        ]}
        exportRowsData={rows}
        enableBatchSelect={true}
        rowIds={data.kycDocuments.map(item => item.id)}
        batchActions={{
          onApprove: handleBatchApprove,
          onReject: handleBatchReject,
        }}
        tooltips={kycTooltips}
        rows={data.kycDocuments.map(item => {
          const matchingUser = data.users.find(u => u.id === item.userId);
          const avatarUrl = matchingUser?.avatar;
          const userEmail = matchingUser?.email || '';

          return [
            <div key={`applicant-${item.id}`} className="flex items-center gap-3">
              <Avatar name={item.userName} src={avatarUrl} type="user" />
              <div className="flex flex-col">
                <strong className="text-gray-900">{item.userName}</strong>
                {userEmail && (
                  <span className="text-xs text-gray-500">{userEmail}</span>
                )}
              </div>
            </div>,
            item.role,
            item.documentType,
            <Badge key={`risk-${item.id}`} value={item.risk} />,
            <Badge key={`status-${item.id}`} value={item.status} />,
            formatDate(item.submittedAt),
            <div key={`actions-${item.id}`} className="relative flex items-center gap-2">
              <ViewButton
                onClick={() =>
                  openDetail(
                    `KYC: ${item.userName}`,
                    item.notes,
                    [
                      { label: 'Role', value: item.role },
                      {
                        label: 'Document type',
                        value: item.documentType,
                      },
                      {
                        label: 'Risk',
                        value: <Badge value={item.risk} />,
                      },
                      {
                        label: 'Status',
                        value: <Badge value={item.status} />,
                      },
                      {
                        label: 'Submitted',
                        value: formatDate(item.submittedAt),
                      },
                      {
                        label: 'Expires',
                        value: formatDate(item.expiresAt),
                      },
                    ],
                    getDocuments('kyc', item.id)
                  )
                }
              />

              <div className="relative ml-2">
                <ActionsMenuButton
                  menuId={`kyc-${item.id}`}
                  isOpen={activeMenu === `kyc-${item.id}`}
                  onToggle={event => toggleMenu(event, `kyc-${item.id}`, 224, 180)}
                  size="sm"
                />
                <ActionsMenuPanel
                  menuId={`kyc-${item.id}`}
                  isOpen={activeMenu === `kyc-${item.id}`}
                  position={menuPosition}
                  onClose={closeMenu}
                  variant="centered"
                >
                  <ActionMenuItem
                    busy={actionBusy === `kyc-approve-${item.id}`}
                    label="Approve"
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() =>
                      runAdminAction(
                        `kyc-approve-${item.id}`,
                        () =>
                          api.post(`/api/v1/kyc/${item.userId}/approve`, {
                            reviewNote: 'Approved from admin web',
                          }),
                        'KYC approved successfully.'
                      ).then(() => closeMenu())
                    }
                  />
                  <ActionMenuItem
                    busy={actionBusy === `kyc-docs-${item.id}`}
                    label="Request docs"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                    onClick={() =>
                      runAdminAction(
                        `kyc-docs-${item.id}`,
                        () =>
                          createAdminNotification(
                            item.userId,
                            'KYC documents requested',
                            'Please upload clearer or updated KYC documents.',
                            {
                              type: 'kyc_documents_requested',
                              documentId: item.id,
                            }
                          ),
                        'Additional KYC documents requested.'
                      ).then(() => closeMenu())
                    }
                  />
                  <ActionMenuItem
                    busy={actionBusy === `kyc-reject-${item.id}`}
                    label="Reject"
                    className="mb-0 bg-rose-100 text-rose-800 hover:bg-rose-200"
                    onClick={() =>
                      runAdminAction(
                        `kyc-reject-${item.id}`,
                        () =>
                          api.post(`/api/v1/kyc/${item.userId}/reject`, {
                            reason: 'Rejected from admin web review',
                            documentIds: [item.id],
                          }),
                        'KYC rejected successfully.'
                      ).then(() => closeMenu())
                    }
                  />
                </ActionsMenuPanel>
              </div>
            </div>,
          ];
        })}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default KycPage;
