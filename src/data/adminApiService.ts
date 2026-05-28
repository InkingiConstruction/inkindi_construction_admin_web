import { api } from '../lib/api';
import type {
  AdminSessionRecord,
  AuditLogRecord,
  DeliveryRecord,
  DisputeRecord,
  AdminDashboardData,
  InspectionRecord,
  KycDocument,
  AdminUser,
  NotificationRecord,
  ProjectRecord,
  RfqRecord,
  SupplierQuoteRecord,
  TransactionRecord,
  UploadedDocumentRecord,
} from './adminTypes';

type AnyRecord = Record<string, any>;

const asList = (value: unknown, keys: string[] = []): AnyRecord[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];

  const record = value as AnyRecord;
  if (Array.isArray(record.data)) return record.data;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key];
  }

  return [];
};

const upper = (value?: string | null) =>
  String(value || 'UNKNOWN').toUpperCase();

const formatName = (user?: AnyRecord | null) =>
  user?.name || user?.email || 'Unknown';

const numberValue = (value: unknown) => Number(value || 0);

const safeDate = (value?: string | Date | null) =>
  value ? new Date(value).toISOString() : new Date().toISOString();

const findSettingValue = (settings: AnyRecord[], key: string) =>
  settings.find((setting) => setting.key === key)?.value;

const request = async <T,>(path: string, fallback: T): Promise<T> => {
  try {
    const response = await api.get<T>(path);
    return response.data;
  } catch (error) {
    console.error(`Unable to load ${path}`, error);
    return fallback;
  }
};

const requestList = async (path: string, keys: string[] = [], required = false) => {
  if (required) {
    const response = await api.get<unknown>(path);
    return asList(response.data, keys);
  }

  const response = await request<unknown>(path, []);
  return asList(response, keys);
};

const toUploadedDocuments = (users: AnyRecord[]): UploadedDocumentRecord[] =>
  users.flatMap((user) =>
    (user.kycDocuments || []).map((document: AnyRecord) => ({
      id: document.id,
      entityType: 'kyc',
      entityId: document.id,
      name: documentLabels[document.type] || document.type,
      fileType: 'KYC document',
      size: 'Cloudinary',
      uploadedBy: user.name,
      uploadedAt: safeDate(document.createdAt || document.updatedAt),
      url: document.cloudinaryUrl,
    })),
  );

const documentLabels: Record<string, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  ier_license: 'IER License',
  indemnity_insurance: 'Professional Indemnity Insurance',
  business_registration: 'Business Registration Certificate',
  tax_compliance: 'Tax Compliance Certificate',
  certification: 'Certification',
};

const mapUser = (user: AnyRecord): AdminUser => ({
  id: user.id,
  name: user.name || user.email || 'Unknown user',
  email: user.email || '',
  username: user.username || user.displayUsername || '',
  phone: user.phoneNumber || '',
  role: upper(user.role) as AdminUser['role'],
  avatar: user.image || undefined,
  createdAt: safeDate(user.createdAt),
  updatedAt: safeDate(user.updatedAt),
  status: user.banned ? 'SUSPENDED' : 'ACTIVE',
  kycStatus: upper(user.kycStatus) as AdminUser['kycStatus'],
});

const mapKycDocuments = (users: AnyRecord[]): KycDocument[] =>
  users.flatMap((user) =>
    (user.kycDocuments || []).map((document: AnyRecord) => ({
      id: document.id,
      userId: user.id,
      userName: user.name,
      role: upper(user.role) as KycDocument['role'],
      documentType: documentLabels[document.type] || document.type,
      status: upper(document.status) as KycDocument['status'],
      submittedAt: safeDate(document.createdAt),
      expiresAt: safeDate(user.kycReviewedAt || document.updatedAt),
      risk: document.status === 'rejected' ? 'HIGH' : 'LOW',
      notes: document.reviewNote || user.kycRejectionReason || '',
    })),
  );

const mapProject = (project: AnyRecord): ProjectRecord => ({
  id: project.id,
  name: project.name || project.title || 'Untitled project',
  client: project.client ? formatName(project.client) : project.clientId || 'Unknown client',
  engineer: project.engineer ? formatName(project.engineer) : project.engineerId || 'Not assigned',
  supervisor:
    project.projectMembers?.find((member: AnyRecord) => member.role === 'supervisor')
      ?.user?.name || 'Not assigned',
  location: project.address || 'Not set',
  budget: numberValue(project.budget),
  escrowBalance: numberValue(project.escrowAccount?.balance),
  progress: calculateProjectProgress(project.milestones || []),
  status: upper(project.status),
  milestones: project.milestones?.length || 0,
  createdAt: safeDate(project.createdAt),
});

const calculateProjectProgress = (milestones: AnyRecord[]) => {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((milestone) =>
    ['paid', 'awaiting_client_payment'].includes(String(milestone.status)),
  ).length;
  return Math.round((completed / milestones.length) * 100);
};

const mapTransaction = (transaction: AnyRecord): TransactionRecord => ({
  id: transaction.id,
  project: transaction.escrowAccount?.project?.name || transaction.escrowAccount?.projectId || 'Unknown project',
  type: upper(transaction.type),
  amount: numberValue(transaction.amount),
  status: upper(transaction.status),
  party: formatName(transaction.actor),
  createdAt: safeDate(transaction.createdAt),
});

const mapDispute = (dispute: AnyRecord): DisputeRecord => ({
  id: dispute.id,
  project: dispute.project?.name || dispute.projectId,
  category: upper(dispute.category),
  openedBy: formatName(dispute.raisedBy),
  status: upper(dispute.status),
  lockedAmount: numberValue(dispute.amountInDispute),
  createdAt: safeDate(dispute.createdAt),
  summary: dispute.description,
});

const mapRfq = (rfq: AnyRecord): RfqRecord => ({
  id: rfq.id,
  project: rfq.project?.name || rfq.projectId,
  material: rfq.title,
  createdBy: formatName(rfq.engineer),
  quotes: rfq.quotes?.length || 0,
  status: upper(rfq.status),
  deadline: safeDate(rfq.deadline),
});

const mapQuote = (quote: AnyRecord): SupplierQuoteRecord => ({
  id: quote.id,
  rfqId: quote.rfqId,
  supplier: formatName(quote.supplier),
  amount: numberValue(quote.totalPrice),
  deliveryDays: numberValue(quote.deliveryDays),
  rating: numberValue(quote.supplier?.rating || quote.rating),
  status: upper(quote.status),
});

const mapDelivery = (delivery: AnyRecord): DeliveryRecord => ({
  id: delivery.id,
  project: delivery.purchaseOrder?.rfq?.project?.name || 'Unknown project',
  supplier: formatName(delivery.supplier),
  material: delivery.purchaseOrder?.rfq?.title || 'Materials',
  gpsStatus: delivery.endGps ? 'VERIFIED' : 'PENDING',
  distanceMeters: 0,
  status: upper(delivery.status),
  eta: safeDate(delivery.arrivedAt || delivery.createdAt),
});

const mapInspection = (inspection: AnyRecord): InspectionRecord => ({
  id: inspection.id,
  project: inspection.milestone?.project?.name || inspection.milestone?.projectId || 'Unknown project',
  supervisor: formatName(inspection.supervisor),
  checklist: JSON.stringify(inspection.checklist || {}),
  qualityRating: numberValue(inspection.rating),
  gpsCheckIn: inspection.gpsCheckIn || inspection.gpsLocation ? 'VERIFIED' : 'UNKNOWN',
  signature: inspection.signatureUrl ? 'SIGNED' : 'PENDING_SIGNATURE',
  status: upper(inspection.decision || 'pending'),
  createdAt: safeDate(inspection.createdAt),
});

const mapAuditLog = (auditLog: AnyRecord): AuditLogRecord => ({
  id: auditLog.id,
  actor: formatName(auditLog.actor),
  action: auditLog.action,
  target: `${auditLog.entityType}${auditLog.entityId ? `:${auditLog.entityId}` : ''}`,
  severity: auditLog.result === 'failed' ? 'CRITICAL' : 'INFO',
  createdAt: safeDate(auditLog.createdAt),
});

const mapNotification = (notification: AnyRecord): NotificationRecord => ({
  id: notification.id,
  userId: notification.userId,
  title: notification.title,
  body: notification.body,
  type: String(notification.channel || 'system'),
  channel: notification.channel,
  read: Boolean(notification.readAt || notification.status === 'read'),
  timestamp: safeDate(notification.createdAt),
  link: '/dashboard/notifications',
});

const mapSession = (session: AnyRecord): AdminSessionRecord => ({
  id: session.id,
  admin: formatName(session.user),
  device: session.userAgent || 'Unknown device',
  ip: session.ipAddress || 'Unknown IP',
  status: new Date(session.expiresAt) > new Date() ? 'ACTIVE' : 'EXPIRED',
  lastSeen: safeDate(session.updatedAt || session.createdAt),
});

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [
    users,
    projects,
    transactions,
    disputes,
    rfqs,
    quotes,
    deliveries,
    inspections,
    auditLogs,
    notifications,
    sessions,
    systemSettings,
  ] = await Promise.all([
    requestList('/api/v1/users', ['users'], true),
    requestList('/api/v1/projects', ['projects'], true),
    requestList('/api/v1/transactions', ['transactions']),
    requestList('/api/v1/disputes', ['disputes']),
    requestList('/api/v1/rfqs', ['rfqs']),
    requestList('/api/v1/quotes', ['quotes']),
    requestList('/api/v1/deliveries', ['deliveries']),
    requestList('/api/v1/inspections', ['inspections']),
    requestList('/api/v1/audit-logs', ['auditLogs', 'activityLogs']),
    requestList('/api/v1/notifications', ['notifications']),
    requestList('/api/v1/sessions', ['sessions']),
    requestList('/api/v1/system-settings', ['systemSettings', 'settings']),
  ]);

  const uploadedDocuments = toUploadedDocuments(users);

  return {
    credentials: [],
    users: users.map(mapUser),
    kycDocuments: mapKycDocuments(users),
    projects: projects.map(mapProject),
    transactions: transactions.map(mapTransaction),
    disputes: disputes.map(mapDispute),
    rfqs: rfqs.map(mapRfq),
    supplierQuotes: quotes.map(mapQuote),
    deliveries: deliveries.map(mapDelivery),
    inspections: inspections.map(mapInspection),
    auditLogs: auditLogs.map(mapAuditLog),
    notifications: notifications.map(mapNotification),
    adminSessions: sessions.map(mapSession),
    securityEvents: auditLogs.map((auditLog) => ({
      id: auditLog.id,
      event: auditLog.action,
      actor: formatName(auditLog.actor),
      severity: auditLog.result === 'failed' ? 'CRITICAL' : 'INFO',
      ip: auditLog.ipAddress || 'Unknown IP',
      createdAt: safeDate(auditLog.createdAt),
    })),
    uploadedDocuments,
    systemSettings: {
      rateLimit: findSettingValue(systemSettings, 'rateLimit') || 'Not configured',
      jwtAccessExpiry: findSettingValue(systemSettings, 'jwtAccessExpiry') || 'Better Auth managed',
      jwtRefreshExpiry: findSettingValue(systemSettings, 'jwtRefreshExpiry') || 'Better Auth managed',
      mtnSandbox: Boolean(findSettingValue(systemSettings, 'mtnSandbox')),
      cloudinaryUploads: Boolean(findSettingValue(systemSettings, 'cloudinaryUploads')),
      emailQueue: findSettingValue(systemSettings, 'emailQueue') || 'Not configured',
      attackProtections: ['Account lockout', 'Rate limiting', 'Admin-only dashboard'],
    },
  };
};
