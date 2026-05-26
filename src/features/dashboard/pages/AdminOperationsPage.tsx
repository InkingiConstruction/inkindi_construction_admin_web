/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AdminOperationsPage.tsx
 * WHAT THIS FILE DOES : Renders every admin operations page and table
 * HOW IT DOES IT      : Loads backend data, renders page-specific tables, and opens detail modals
 * DATA SOURCE         : Backend API and authenticated admin context
 * DATA DESTINATION    : React admin dashboard UI
 * PRINCIPLE APPLIED   : KISS
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Eye,
  Landmark,
  Lock,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wrench,
  Scale,
  ScrollText,
  X,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  formatDate,
  formatRwf,
  type UploadedDocumentRecord,
} from '../../../data/adminTypes';
import { getAdminDashboardData } from '../../../data/adminApiService';
import { api } from '../../../lib/api';

export type PageKind =
  | 'overview'
  | 'kyc'
  | 'users'
  | 'projects'
  | 'escrow'
  | 'disputes'
  | 'supply'
  | 'inspections'
  | 'reports'
  | 'audit'
  | 'notifications'
  | 'settings'
  | 'profile';

interface AdminOperationsPageProps {
  page: PageKind;
}

type Row = Record<string, string | number | boolean>;
type DetailField = { label: string; value: React.ReactNode };
type DetailModalState = {
  title: string;
  subtitle: string;
  fields: DetailField[];
  documents: UploadedDocumentRecord[];
} | null;
type ProfileFormState = {
  name: string;
  username: string;
  phone: string;
  avatar: string;
};
type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
};

const PAGE_SIZE = 6;

const statusClass = (status: string) => {
  if (['APPROVED', 'ACTIVE', 'COMPLETED', 'INFO', 'VERIFIED', 'SELECTED', 'SUBMITTED', 'CAPTURED'].includes(status)) return 'bg-emerald-50 text-emerald-700';
  if (['PENDING', 'UNDER_REVIEW', 'MILESTONE_REVIEW', 'WARNING', 'MEDIATION', 'IN_TRANSIT', 'SCHEDULED', 'PENDING_SIGNATURE', 'OPEN'].includes(status)) return 'bg-amber-50 text-amber-700';
  if (['REJECTED', 'SUSPENDED', 'HIGH', 'CRITICAL', 'FAILED'].includes(status)) return 'bg-rose-50 text-rose-700';
  return 'bg-gray-100 text-gray-700';
};

const Badge: React.FC<{ value: string }> = ({ value }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(value)}`}>
    {value.replaceAll('_', ' ')}
  </span>
);

const ViewButton: React.FC<{ label?: string; onClick: () => void }> = ({ label = 'View', onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50"
  >
    <Eye size={13} />
    {label}
  </button>
);

const DetailModal: React.FC<{ detail: DetailModalState; onClose: () => void }> = ({ detail, onClose }) => {
  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl md:max-w-3xl md:rounded-xl" onClick={event => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{detail.title}</h2>
            <p className="text-sm text-gray-500">{detail.subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close detail modal">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {detail.fields.map(field => (
              <div key={field.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-bold uppercase text-gray-400">{field.label}</p>
                <div className="mt-1 text-sm font-semibold text-gray-900">{field.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Uploaded documents</h3>
              <span className="rounded-full bg-brand-light px-2 py-1 text-[11px] font-bold text-brand">{detail.documents.length} files</span>
            </div>
            {detail.documents.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {detail.documents.map(document => (
                  <div key={document.id} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                      <img src={document.url} alt={document.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="font-bold text-gray-900">{document.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{document.fileType} | {document.size} | {formatDate(document.uploadedAt)}</p>
                    <p className="mt-1 text-xs text-gray-500">Uploaded by {document.uploadedBy}</p>
                    <a href={document.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white">
                      Preview file <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No uploaded documents are linked to this record yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const escapeCsv = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;

const exportRows = (label: string, rows: Row[], type: 'csv' | 'xlsx' | 'pdf') => {
  const safeLabel = label.toLowerCase().replaceAll(/\s+/g, '-');
  const headers = Object.keys(rows[0] ?? { notice: 'No data' });
  const values = rows.length ? rows : [{ notice: 'No data available' }];

  if (type === 'csv') {
    const csv = [headers.join(','), ...values.map(row => headers.map(header => escapeCsv(row[header] ?? '')).join(','))].join('\n');
    downloadFile(`${safeLabel}.csv`, csv, 'text/csv;charset=utf-8');
  }

  if (type === 'xlsx') {
    const table = `<table><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${values.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    downloadFile(`${safeLabel}.xls`, table, 'application/vnd.ms-excel;charset=utf-8');
  }

  if (type === 'pdf') {
    const html = `<html><head><title>${label}</title><style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>${label}</h1><p>Use browser print to save as PDF.</p><table><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${values.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    downloadFile(`${safeLabel}.html`, html, 'text/html;charset=utf-8');
  }
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; capabilities: string[] }> = ({ icon, title, subtitle, capabilities }) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">{title}</h1>
          <p className="max-w-3xl text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="rounded-lg border border-brand-muted bg-brand-light px-3 py-2 text-xs font-semibold text-brand">
        Admin only
      </div>
    </div>
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {capabilities.slice(0, 6).map(item => (
        <div key={item} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-600">
          <CheckCircle className="mt-0.5 shrink-0 text-brand" size={14} />
          {item}
        </div>
      ))}
    </div>
  </div>
);

const StatTile: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-brand">{icon}</div>
    <p className="text-xl font-black text-gray-900 md:text-2xl">{value}</p>
    <p className="mt-1 text-xs font-semibold text-gray-500">{label}</p>
  </div>
);

const DataTable: React.FC<{ title: string; headers: string[]; rows: React.ReactNode[][]; exportRowsData: Row[] }> = ({ title, headers, rows, exportRowsData }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = rows.filter(row => row.map(cell => String(cell)).join(' ').toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{filtered.length} records</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search table"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportRows(title, exportRowsData, 'csv')} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Export CSV"><Download size={16} /></button>
            <button onClick={() => exportRows(title, exportRowsData, 'xlsx')} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Export Excel"><FileSpreadsheet size={16} /></button>
            <button onClick={() => exportRows(title, exportRowsData, 'pdf')} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Export PDF"><FileText size={16} /></button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
            <tr>{headers.map(header => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/60">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top">{cell}</td>)}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr className="border-t border-gray-50">
                <td className="px-4 py-6 text-center text-sm font-semibold text-gray-500" colSpan={headers.length}>
                  No backend records found for this table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-3">
        <p className="text-xs font-medium text-gray-500">Page {safePage} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => setPage(current => Math.max(1, current - 1))} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40" disabled={safePage === 1}><ChevronLeft size={15} /></button>
          <button onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40" disabled={safePage === totalPages}><ChevronRight size={15} /></button>
        </div>
      </div>
    </div>
  );
};

const useAdminData = () => {
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

const capabilities: Record<PageKind, string[]> = {
  overview: ['View dashboard KPIs', 'Track platform growth', 'Monitor escrow exposure', 'See urgent operational queues', 'Export operational snapshots', 'Review admin-only access state'],
  kyc: ['View pending KYC submissions', 'Preview identity documents', 'Approve or reject applications', 'Request additional documents', 'Verify IER licenses', 'Export KYC compliance report'],
  users: ['View all users', 'Search by role or status', 'Suspend and activate accounts', 'Change roles', 'Force password reset', 'Export user list'],
  projects: ['View all projects', 'Override project status', 'View audit trail', 'Track contractor metrics', 'View Gantt timeline', 'Access project photos and documents'],
  escrow: ['View total escrow balance', 'View project balances', 'Run reconciliation', 'Manual emergency override', 'Configure platform fees', 'Monitor MTN and Airtel health'],
  disputes: ['View open disputes', 'Filter by priority', 'Review evidence', 'Issue resolution decisions', 'Release locked funds', 'Export dispute analytics'],
  supply: ['View RFQs', 'View supplier quotes', 'Monitor purchase orders', 'Track deliveries', 'Verify GPS delivery', 'Review supplier ratings'],
  inspections: ['View inspection reports', 'Review checklists', 'Access photos and signatures', 'Monitor completion rates', 'Track quality ratings', 'Verify GPS check-ins'],
  reports: ['Generate compliance reports', 'Generate financial reports', 'Generate supplier reports', 'View revenue reports', 'Export audit logs', 'Schedule automated reports'],
  audit: ['View complete audit log', 'Search by user/action/entity', 'Export logs', 'Verify tamper chain', 'View security events', 'Monitor API key usage'],
  notifications: ['Send broadcasts', 'Target users by role', 'Edit email templates', 'View queue status', 'Track delivery logs', 'Resend failed notifications'],
  settings: ['Edit JSONB settings', 'Configure fees', 'Manage feature flags', 'Trigger backups', 'Monitor environment health', 'Set maintenance mode'],
  profile: ['Secure admin profile', 'Enable TOTP 2FA', 'View active sessions', 'Force logout sessions', 'Change password', 'View own audit trail'],
};

const AdminOperationsPage: React.FC<AdminOperationsPageProps> = ({ page }) => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const { user, refreshUser } = useAuth();
  const [detail, setDetail] = useState<DetailModalState>(null);
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: '',
    username: '',
    phone: '',
    avatar: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: true,
  });

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      escrowTotal: data.projects.reduce((total, item) => total + item.escrowBalance, 0),
      openDisputes: data.disputes.filter(item => item.status !== 'RESOLVED').length,
      pendingKyc: data.kycDocuments.filter(item => item.status === 'PENDING').length,
      activeProjects: data.projects.filter(item => item.status !== 'COMPLETED').length,
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

  const profileUser = useMemo(() => {
    if (!data) return user;
    return data.users.find(item => item.id === user?.id) ?? data.users.find(item => item.role === 'ADMIN') ?? user;
  }, [data, user]);

  useEffect(() => {
    if (page !== 'profile' || !profileUser) return;

    setProfileForm({
      name: profileUser.name || '',
      username: profileUser.username || '',
      phone: profileUser.phone || '',
      avatar: profileUser.avatar || '',
    });
  }, [page, profileUser]);

  if (error) return <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>;
  if (isLoading || !data || !stats) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;

  const getDocuments = (entityType: string, entityId: string) =>
    data.uploadedDocuments.filter(document => document.entityType === entityType && document.entityId === entityId);

  const openDetail = (title: string, subtitle: string, fields: DetailField[], documents: UploadedDocumentRecord[]) => {
    setDetail({ title, subtitle, fields, documents });
  };

  const runAdminAction = async (key: string, action: () => Promise<unknown>, success: string) => {
    setActionBusy(key);
    setActionError('');
    setActionMessage('');

    try {
      await action();
      setActionMessage(success);
      await refreshData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Action failed');
    } finally {
      setActionBusy('');
    }
  };

  const createAdminNotification = (userId: string, title: string, body: string, dataPayload: Record<string, string>) =>
    api.post('/api/v1/notifications', {
      userId,
      channel: 'in_app',
      title,
      body,
      data: dataPayload,
    });

  const logAdminAction = (action: string, metadata: Record<string, unknown>) =>
    api.post('/api/v1/activity-logs', {
      action,
      metadata,
    });

  const updateProfile = () =>
    runAdminAction('profile-save', async () => {
      if (!profileUser?.id) throw new Error('No current admin user found');

      const payload = {
        name: profileForm.name.trim(),
        username: profileForm.username.trim() || null,
        displayUsername: profileForm.username.trim() || null,
        phoneNumber: profileForm.phone.trim() || null,
        image: profileForm.avatar.trim() || null,
      };

      await api.post('/api/v1/auth/update-user', payload);
      await api.put(`/api/v1/users/${profileUser.id}`, payload);
      await refreshUser();
      await refreshData();
    }, 'Profile updated successfully.');

  const changePassword = () =>
    runAdminAction('profile-password', async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New password and confirm password must match');
      }

      if (passwordForm.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      await api.post('/api/v1/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: passwordForm.revokeOtherSessions,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: true,
      });
      await refreshUser();
      await refreshData();
    }, 'Password changed successfully.');

  const section = (icon: React.ReactNode, title: string, subtitle: string, children: React.ReactNode) => (
    <div className="space-y-5 pb-12">
      <SectionHeader icon={icon} title={title} subtitle={subtitle} capabilities={capabilities[page]} />
      {actionError && <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{actionError}</div>}
      {actionMessage && <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{actionMessage}</div>}
      {children}
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );

  if (page === 'overview') {
    return section(<ShieldCheck size={20} />, 'Admin Overview', 'A mobile-first operations console for the full InkingiPro admin surface.', (
      <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatTile label="Users" value={data.users.length} icon={<Users size={18} />} />
          <StatTile label="Pending KYC" value={stats.pendingKyc} icon={<ClipboardCheck size={18} />} />
          <StatTile label="Projects" value={stats.activeProjects} icon={<Briefcase size={18} />} />
          <StatTile label="Escrow" value={formatRwf(stats.escrowTotal)} icon={<Landmark size={18} />} />
          <StatTile label="Unread Alerts" value={stats.unreadNotifications} icon={<Bell size={18} />} />
        </div>
        <DataTable
          title="Priority Operations"
          headers={['Area', 'Item', 'Status', 'Owner']}
          exportRowsData={priorityRows}
          rows={priorityRows.map(item => [item.area, item.item, <Badge value={item.status} />, item.owner])}
        />
      </>
    ));
  }

  if (page === 'kyc') {
    const rows = data.kycDocuments.map(item => ({ applicant: item.userName, role: item.role, document: item.documentType, risk: item.risk, status: item.status, submitted: formatDate(item.submittedAt), expires: formatDate(item.expiresAt) }));
    return section(<ClipboardCheck size={20} />, 'KYC & Identity Verification', 'Review identity files, professional licenses, certificates, expiry risk, and compliance evidence.', (
      <DataTable title="KYC Review Queue" headers={['Applicant', 'Role', 'Document', 'Risk', 'Status', 'Submitted', 'Actions']} exportRowsData={rows} rows={data.kycDocuments.map(item => [
        <strong>{item.userName}</strong>, item.role, item.documentType, <Badge value={item.risk} />, <Badge value={item.status} />, formatDate(item.submittedAt),
        <div className="flex flex-wrap gap-2">
          <ViewButton onClick={() => openDetail(`KYC: ${item.userName}`, item.notes, [
            { label: 'Role', value: item.role },
            { label: 'Document type', value: item.documentType },
            { label: 'Risk', value: <Badge value={item.risk} /> },
            { label: 'Status', value: <Badge value={item.status} /> },
            { label: 'Submitted', value: formatDate(item.submittedAt) },
            { label: 'Expires', value: formatDate(item.expiresAt) },
          ], getDocuments('kyc', item.id))} />
          <button disabled={actionBusy === `kyc-approve-${item.id}`} onClick={() => runAdminAction(`kyc-approve-${item.id}`, () => api.post(`/api/v1/kyc/${item.userId}/approve`, { reviewNote: 'Approved from admin web' }), 'KYC approved successfully.')} className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white disabled:opacity-50">Approve</button>
          <button disabled={actionBusy === `kyc-docs-${item.id}`} onClick={() => runAdminAction(`kyc-docs-${item.id}`, () => createAdminNotification(item.userId, 'KYC documents requested', 'Please upload clearer or updated KYC documents.', { type: 'kyc_documents_requested', documentId: item.id }), 'Additional KYC documents requested.')} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 disabled:opacity-50">Request docs</button>
          <button disabled={actionBusy === `kyc-reject-${item.id}`} onClick={() => runAdminAction(`kyc-reject-${item.id}`, () => api.post(`/api/v1/kyc/${item.userId}/reject`, { reason: 'Rejected from admin web review', documentIds: [item.id] }), 'KYC rejected successfully.')} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 disabled:opacity-50">Reject</button>
        </div>,
      ])} />
    ));
  }

  if (page === 'users') {
    const rows = data.users.map(item => ({ name: item.name, email: item.email, phone: item.phone, role: item.role, kyc: item.kycStatus, status: item.status, joined: formatDate(item.createdAt) }));
    return section(<Users size={20} />, 'User Management', 'Manage admins, clients, engineers, supervisors, and suppliers while keeping mobile users outside the web dashboard.', (
      <DataTable title="All Users" headers={['User', 'Contact', 'Role', 'KYC', 'Status', 'Actions']} exportRowsData={rows} rows={data.users.map(item => [
        <strong>{item.name}</strong>, <div><p>{item.email}</p><p className="text-xs text-gray-500">{item.phone}</p></div>, item.role, <Badge value={item.kycStatus} />, <Badge value={item.status} />,
        <div className="flex flex-wrap gap-2">
          <ViewButton label="Profile" onClick={() => openDetail(`User: ${item.name}`, 'Complete user profile snapshot from backend admin data.', [
            { label: 'Email', value: item.email },
            { label: 'Phone', value: item.phone },
            { label: 'Username', value: item.username },
            { label: 'Role', value: item.role },
            { label: 'KYC', value: <Badge value={item.kycStatus} /> },
            { label: 'Status', value: <Badge value={item.status} /> },
          ], data.uploadedDocuments.filter(document => document.uploadedBy === item.name))} />
          <button disabled={actionBusy === `reset-${item.id}`} onClick={() => runAdminAction(`reset-${item.id}`, () => createAdminNotification(item.id, 'Password reset requested', 'An admin requested that you reset your password.', { type: 'password_reset_requested' }), 'Password reset request sent.')} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold disabled:opacity-50">Reset</button>
          <button disabled={actionBusy === `suspend-${item.id}`} onClick={() => {
            const shouldSuspend = item.status !== 'SUSPENDED';
            return runAdminAction(`suspend-${item.id}`, () => api.put(`/api/v1/users/${item.id}`, {
              banned: shouldSuspend,
              banReason: shouldSuspend ? 'Suspended from admin web' : null,
              banExpires: null,
            }), shouldSuspend ? 'User suspended successfully.' : 'User activated successfully.');
          }} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 disabled:opacity-50">{item.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</button>
        </div>,
      ])} />
    ));
  }

  if (page === 'projects') {
    const rows = data.projects.map(item => ({ project: item.name, client: item.client, engineer: item.engineer, supervisor: item.supervisor, location: item.location, budget: item.budget, progress: item.progress, status: item.status }));
    return section(<Briefcase size={20} />, 'Project Portfolio Oversight', 'Audit project timelines, assignments, budgets, documents, photos, Gantt state, and contractor performance.', (
      <DataTable title="Project Portfolio" headers={['Project', 'Team', 'Location', 'Budget', 'Progress', 'Status', 'Actions']} exportRowsData={rows} rows={data.projects.map(item => [
        <strong>{item.name}</strong>, <div><p>{item.client}</p><p className="text-xs text-gray-500">{item.engineer} / {item.supervisor}</p></div>, item.location, formatRwf(item.budget), `${item.progress}%`, <Badge value={item.status} />,
        <div className="flex flex-wrap gap-2">
          <ViewButton label="Documents" onClick={() => openDetail(`Project: ${item.name}`, 'Project documents, photos, ownership, budget, and status details.', [
            { label: 'Client', value: item.client },
            { label: 'Engineer', value: item.engineer },
            { label: 'Supervisor', value: item.supervisor },
            { label: 'Location', value: item.location },
            { label: 'Budget', value: formatRwf(item.budget) },
            { label: 'Progress', value: `${item.progress}%` },
          ], getDocuments('project', item.id))} />
          <button onClick={() => openDetail(`Gantt: ${item.name}`, 'Milestone progress loaded from the backend project timeline.', [
            { label: 'Project', value: item.name },
            { label: 'Milestones', value: item.milestones },
            { label: 'Progress', value: `${item.progress}%` },
            { label: 'Status', value: <Badge value={item.status} /> },
          ], getDocuments('project', item.id))} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold">Gantt</button>
          <button disabled={actionBusy === `project-override-${item.id}`} onClick={() => runAdminAction(`project-override-${item.id}`, () => api.patch(`/api/v1/projects/${item.id}/status`, { status: item.status === 'PAUSED' ? 'active' : 'paused' }), 'Project status overridden successfully.')} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 disabled:opacity-50">Override</button>
        </div>,
      ])} />
    ));
  }

  if (page === 'escrow') {
    const rows = data.transactions.map(item => ({ id: item.id, project: item.project, type: item.type, party: item.party, amount: item.amount, status: item.status, date: formatDate(item.createdAt) }));
    return section(<Landmark size={20} />, 'Financial & Escrow Oversight', 'Reconcile deposits, payment releases, fee configuration, provider health, and emergency overrides.', (
      <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Escrow Held" value={formatRwf(stats.escrowTotal)} icon={<Lock size={18} />} />
          <StatTile label="Transactions" value={data.transactions.length} icon={<FileText size={18} />} />
          <StatTile label="Open Disputes" value={stats.openDisputes} icon={<Scale size={18} />} />
          <StatTile label="Provider Records" value={data.transactions.length > 0 ? 'Loaded' : 'No records'} icon={<CheckCircle size={18} />} />
        </div>
        <DataTable title="Append-only Transaction History" headers={['Transaction', 'Project', 'Type', 'Party', 'Amount', 'Status', 'Action']} exportRowsData={rows} rows={data.transactions.map(item => [item.id, item.project, item.type.replaceAll('_', ' '), item.party, formatRwf(item.amount), <Badge value={item.status} />, <ViewButton onClick={() => openDetail(`Transaction: ${item.id}`, 'Append-only transaction record for reconciliation review.', [
          { label: 'Project', value: item.project },
          { label: 'Type', value: item.type.replaceAll('_', ' ') },
          { label: 'Party', value: item.party },
          { label: 'Amount', value: formatRwf(item.amount) },
          { label: 'Status', value: <Badge value={item.status} /> },
          { label: 'Date', value: formatDate(item.createdAt) },
        ], [])} />])} />
      </>
    ));
  }

  if (page === 'disputes') {
    const rows = data.disputes.map(item => ({ id: item.id, project: item.project, category: item.category, openedBy: item.openedBy, lockedAmount: item.lockedAmount, status: item.status, summary: item.summary }));
    return section(<Scale size={20} />, 'Dispute Management', 'Mediate disputes, review evidence, handle appeals, and release locked escrow based on decisions.', (
      <DataTable title="Dispute Cases" headers={['Case', 'Project', 'Category', 'Opened By', 'Locked', 'Status', 'Decision']} exportRowsData={rows} rows={data.disputes.map(item => [item.id, item.project, item.category, item.openedBy, formatRwf(item.lockedAmount), <Badge value={item.status} />, <div className="flex flex-wrap gap-2">
        <ViewButton label="Evidence" onClick={() => openDetail(`Dispute: ${item.id}`, item.summary, [
          { label: 'Project', value: item.project },
          { label: 'Category', value: item.category },
          { label: 'Opened by', value: item.openedBy },
          { label: 'Locked amount', value: formatRwf(item.lockedAmount) },
          { label: 'Status', value: <Badge value={item.status} /> },
          { label: 'Created', value: formatDate(item.createdAt) },
        ], getDocuments('dispute', item.id))} />
        <button disabled={actionBusy === `resolve-${item.id}`} onClick={() => runAdminAction(`resolve-${item.id}`, () => api.put(`/api/v1/disputes/${item.id}`, {
          status: 'resolved_partial',
          resolution: { note: 'Resolved from admin web' },
        }), 'Dispute resolved successfully.')} className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-white disabled:opacity-50">Resolve</button>
      </div>])} />
    ));
  }

  if (page === 'supply') {
    const rows = [
      ...data.rfqs.map(item => ({ type: 'RFQ', id: item.id, project: item.project, supplier: '', material: item.material, status: item.status })),
      ...data.deliveries.map(item => ({ type: 'Delivery', id: item.id, project: item.project, supplier: item.supplier, material: item.material, status: item.status })),
    ];
    return section(<Truck size={20} />, 'Supply Chain Oversight', 'Monitor RFQs, quotes, purchase orders, deliveries, GPS confirmations, and supplier compliance.', (
      <>
        <DataTable title="RFQs & Supplier Quotes" headers={['ID', 'Project/RFQ', 'Material/Supplier', 'Quotes/Amount', 'Status', 'Due/Rating']} exportRowsData={rows} rows={[
          ...data.rfqs.map(item => [item.id, item.project, item.material, item.quotes, <Badge value={item.status} />, <ViewButton onClick={() => openDetail(`RFQ: ${item.id}`, 'Request for quote and supplier response overview.', [
            { label: 'Project', value: item.project },
            { label: 'Material', value: item.material },
            { label: 'Created by', value: item.createdBy },
            { label: 'Quotes', value: item.quotes },
            { label: 'Status', value: <Badge value={item.status} /> },
            { label: 'Deadline', value: formatDate(item.deadline) },
          ], [])} />]),
          ...data.supplierQuotes.map(item => [item.id, item.rfqId, item.supplier, formatRwf(item.amount), <Badge value={item.status} />, <ViewButton onClick={() => openDetail(`Quote: ${item.id}`, 'Supplier quote details for procurement review.', [
            { label: 'RFQ', value: item.rfqId },
            { label: 'Supplier', value: item.supplier },
            { label: 'Amount', value: formatRwf(item.amount) },
            { label: 'Delivery days', value: item.deliveryDays },
            { label: 'Rating', value: `${item.rating} stars` },
            { label: 'Status', value: <Badge value={item.status} /> },
          ], data.uploadedDocuments.filter(document => document.uploadedBy === item.supplier))} />]),
        ]} />
        <DataTable title="Delivery Tracking" headers={['Delivery', 'Project', 'Supplier', 'Material', 'GPS', 'Distance', 'Action']} exportRowsData={data.deliveries.map(item => ({ ...item, eta: formatDate(item.eta) }))} rows={data.deliveries.map(item => [item.id, item.project, item.supplier, item.material, <Badge value={item.gpsStatus} />, `${item.distanceMeters}m`, <ViewButton onClick={() => openDetail(`Delivery: ${item.id}`, 'Delivery tracking details and proof of delivery files.', [
          { label: 'Project', value: item.project },
          { label: 'Supplier', value: item.supplier },
          { label: 'Material', value: item.material },
          { label: 'GPS status', value: <Badge value={item.gpsStatus} /> },
          { label: 'Distance', value: `${item.distanceMeters}m` },
          { label: 'ETA', value: formatDate(item.eta) },
        ], getDocuments('delivery', item.id))} />])} />
      </>
    ));
  }

  if (page === 'inspections') {
    const rows = data.inspections.map(item => ({ ...item, createdAt: formatDate(item.createdAt) }));
    return section(<Wrench size={20} />, 'Inspection & Quality Control', 'Review supervisor checklists, photos, signatures, GPS check-ins, and quality ratings.', (
      <DataTable title="Inspection Reports" headers={['Inspection', 'Project', 'Supervisor', 'Checklist', 'Quality', 'GPS', 'Action']} exportRowsData={rows} rows={data.inspections.map(item => [item.id, item.project, item.supervisor, item.checklist, `${item.qualityRating}/5`, <Badge value={item.gpsCheckIn} />, <ViewButton onClick={() => openDetail(`Inspection: ${item.id}`, 'Supervisor inspection report, checklist, signature, and photo files.', [
        { label: 'Project', value: item.project },
        { label: 'Supervisor', value: item.supervisor },
        { label: 'Checklist', value: item.checklist },
        { label: 'Quality rating', value: `${item.qualityRating}/5` },
        { label: 'GPS check-in', value: <Badge value={item.gpsCheckIn} /> },
        { label: 'Signature', value: <Badge value={item.signature} /> },
      ], getDocuments('inspection', item.id))} />])} />
    ));
  }

  if (page === 'reports') {
    return section(<BarChart3 size={20} />, 'Analytics & Reporting', 'Generate PDF, Excel, CSV, compliance, financial, supplier, growth, revenue, and audit reports.', (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Project Progress Gantt', data.projects.map(item => ({ project: item.name, progress: item.progress, status: item.status }))],
          ['Financial Reconciliation', data.transactions.map(item => ({ project: item.project, amount: item.amount, status: item.status }))],
          ['Supplier Performance', data.supplierQuotes.map(item => ({ supplier: item.supplier, amount: item.amount, rating: item.rating }))],
          ['KYC Compliance', data.kycDocuments.map(item => ({ user: item.userName, status: item.status, risk: item.risk }))],
        ].map(([label, rows]) => (
          <div key={String(label)} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <FileText className="mb-3 text-brand" size={20} />
            <h2 className="font-bold text-gray-900">{String(label)}</h2>
            <p className="mt-1 text-xs text-gray-500">Export the full report dataset.</p>
            <div className="mt-4 flex gap-1">
              <button onClick={() => exportRows(String(label), rows as Row[], 'csv')} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">CSV</button>
              <button onClick={() => exportRows(String(label), rows as Row[], 'xlsx')} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">Excel</button>
              <button onClick={() => exportRows(String(label), rows as Row[], 'pdf')} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">PDF</button>
            </div>
          </div>
        ))}
      </div>
    ));
  }

  if (page === 'audit') {
    const rows = data.auditLogs.map(item => ({ actor: item.actor, action: item.action, target: item.target, severity: item.severity, date: formatDate(item.createdAt) }));
    return section(<ScrollText size={20} />, 'Audit & Compliance', 'Search audit logs, security events, session history, API usage, and tamper-chain verification.', (
      <>
        <DataTable title="System Audit Log" headers={['Actor', 'Action', 'Target', 'Severity', 'Action']} exportRowsData={rows} rows={data.auditLogs.map(item => [item.actor, item.action.replaceAll('_', ' '), item.target, <Badge value={item.severity} />, <ViewButton onClick={() => openDetail(`Audit: ${item.id}`, 'Compliance event details from the backend audit trail.', [
          { label: 'Actor', value: item.actor },
          { label: 'Action', value: item.action.replaceAll('_', ' ') },
          { label: 'Target', value: item.target },
          { label: 'Severity', value: <Badge value={item.severity} /> },
          { label: 'Date', value: formatDate(item.createdAt) },
          { label: 'Record source', value: 'Backend audit log' },
        ], [])} />])} />
        <DataTable title="Security Events" headers={['Event', 'Actor', 'Severity', 'IP', 'Action']} exportRowsData={data.securityEvents.map(item => ({ ...item, createdAt: formatDate(item.createdAt) }))} rows={data.securityEvents.map(item => [item.event.replaceAll('_', ' '), item.actor, <Badge value={item.severity} />, item.ip, <ViewButton onClick={() => openDetail(`Security event: ${item.id}`, 'Security event details for compliance review.', [
          { label: 'Event', value: item.event.replaceAll('_', ' ') },
          { label: 'Actor', value: item.actor },
          { label: 'Severity', value: <Badge value={item.severity} /> },
          { label: 'IP address', value: item.ip },
          { label: 'Created', value: formatDate(item.createdAt) },
          { label: 'Status', value: 'Loaded from backend security events' },
        ], [])} />])} />
      </>
    ));
  }

  if (page === 'notifications') {
    const rows = data.notifications.map(item => ({ title: item.title, body: item.body, type: item.type, read: item.read, timestamp: formatDate(item.timestamp) }));
    return section(<Bell size={20} />, 'Notification Management', 'Broadcast, target by role, edit templates, monitor queue status, and resend failures.', (
      <DataTable title="Notification Queue" headers={['Title', 'Body', 'Type', 'State', 'Action']} exportRowsData={rows} rows={data.notifications.map(item => [<strong>{item.title}</strong>, item.body, item.type, item.read ? <Badge value="COMPLETED" /> : <Badge value="PENDING" />, <div className="flex flex-wrap gap-2">
        <ViewButton onClick={() => openDetail(`Notification: ${item.title}`, item.body, [
          { label: 'Type', value: item.type },
          { label: 'Read', value: item.read ? 'Yes' : 'No' },
          { label: 'Timestamp', value: formatDate(item.timestamp) },
          { label: 'Route', value: item.link },
        ], [])} />
        <button disabled={actionBusy === `resend-${item.id}`} onClick={() => runAdminAction(`resend-${item.id}`, () => {
          if (!item.userId) throw new Error('Notification has no user to resend to');
          return api.post('/api/v1/notifications', {
            userId: item.userId,
            channel: item.channel || item.type || 'in_app',
            title: item.title,
            body: item.body,
            data: { resendOf: item.id, type: 'notification_resend' },
          });
        }, 'Notification resent successfully.')} className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold disabled:opacity-50">Resend</button>
      </div>])} />
    ));
  }

  if (page === 'profile') {
    const profileSessions = data.adminSessions.filter(item => item.admin === profileUser?.name);
    const visibleSessions = profileSessions.length > 0 ? profileSessions : data.adminSessions;

    return section(<UserCog size={20} />, 'Admin Profile & Access', 'Manage your admin profile, 2FA readiness, sessions, password controls, and personal audit trail.', (
      <>
        <div className="grid gap-3 xl:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            {profileForm.avatar ? (
              <img src={profileForm.avatar} alt={profileUser?.name || 'Admin user'} className="mb-4 h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-lg font-black text-white">{profileUser?.name?.charAt(0) || 'A'}</div>
            )}
            <h2 className="text-lg font-bold text-gray-900">{profileUser?.name || 'Admin user'}</h2>
            <p className="text-sm text-gray-500">{profileUser?.email || 'No email loaded'}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-semibold">Role:</span> {profileUser?.role || 'ADMIN'}</p>
              <p><span className="font-semibold">Email:</span> Managed by Better Auth</p>
              <p><span className="font-semibold">Access:</span> Admin portal only</p>
            </div>
            <div className="mt-4">
              <button disabled={actionBusy === 'profile-2fa'} onClick={() => runAdminAction('profile-2fa', () => logAdminAction('totp_setup_requested', { source: 'admin_web' }), '2FA setup request recorded.')} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold disabled:opacity-50">Record 2FA setup request</button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm xl:col-span-2">
            <h2 className="text-base font-bold text-gray-900">Profile details</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Full name
                <input value={profileForm.name} onChange={event => setProfileForm(current => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Username
                <input value={profileForm.username} onChange={event => setProfileForm(current => ({ ...current, username: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Phone number
                <input value={profileForm.phone} onChange={event => setProfileForm(current => ({ ...current, phone: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Avatar URL
                <input value={profileForm.avatar} onChange={event => setProfileForm(current => ({ ...current, avatar: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700 md:col-span-2">
                Email address
                <input value={profileUser?.email || ''} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button disabled={actionBusy === 'profile-save'} onClick={updateProfile} className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save profile</button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm xl:col-span-1">
            <h2 className="text-base font-bold text-gray-900">Password</h2>
            <div className="mt-4 space-y-3">
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Current password
                <input type="password" value={passwordForm.currentPassword} onChange={event => setPasswordForm(current => ({ ...current, currentPassword: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                New password
                <input type="password" value={passwordForm.newPassword} onChange={event => setPasswordForm(current => ({ ...current, newPassword: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="space-y-1 text-sm font-semibold text-gray-700">
                Confirm password
                <input type="password" value={passwordForm.confirmPassword} onChange={event => setPasswordForm(current => ({ ...current, confirmPassword: event.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={passwordForm.revokeOtherSessions} onChange={event => setPasswordForm(current => ({ ...current, revokeOtherSessions: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand" />
                Sign out other sessions
              </label>
              <button disabled={actionBusy === 'profile-password'} onClick={changePassword} className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Change password</button>
            </div>
          </div>

          <div className="xl:col-span-2">
            <DataTable title="Active Admin Sessions" headers={['Session', 'Admin', 'Device', 'IP', 'Status', 'Last Seen']} exportRowsData={visibleSessions.map(item => ({ ...item, lastSeen: formatDate(item.lastSeen) }))} rows={visibleSessions.map(item => [item.id, item.admin, item.device, item.ip, <Badge value={item.status} />, formatDate(item.lastSeen)])} />
          </div>
        </div>
      </>
    ));
  }

  return section(<Settings size={20} />, 'System Configuration', 'Configure fees, rate limits, feature flags, maintenance mode, integrations, backups, and environment health.', (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(data.systemSettings).filter(([key]) => key !== 'attackProtections').map(([key, value]) => (
          <div key={key} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-400">{key.replaceAll(/([A-Z])/g, ' $1')}</p>
            <p className="mt-1 font-semibold text-gray-900">{String(value)}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mb-2" size={18} />
        These settings are loaded from the authenticated backend admin APIs.
      </div>
    </>
  ));
};

export default AdminOperationsPage;
