import type { User } from '../shared/types';

export type AdminRole = 'ADMIN' | 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminUser extends User {
  role: AdminRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
  kycStatus: ReviewStatus;
}

export interface KycDocument {
  id: string;
  userId: string;
  userName: string;
  role: AdminRole;
  documentType: string;
  status: ReviewStatus;
  submittedAt: string;
  expiresAt: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  client: string;
  engineer: string;
  supervisor: string;
  location: string;
  budget: number;
  escrowBalance: number;
  progress: number;
  status: string;
  milestones: number;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  project: string;
  type: string;
  amount: number;
  status: string;
  party: string;
  createdAt: string;
}

export interface DisputeRecord {
  id: string;
  project: string;
  category: string;
  openedBy: string;
  status: string;
  lockedAmount: number;
  createdAt: string;
  summary: string;
}

export interface RfqRecord {
  id: string;
  project: string;
  material: string;
  createdBy: string;
  quotes: number;
  status: string;
  deadline: string;
}

export interface SupplierQuoteRecord {
  id: string;
  rfqId: string;
  supplier: string;
  amount: number;
  deliveryDays: number;
  rating: number;
  status: string;
}

export interface DeliveryRecord {
  id: string;
  project: string;
  supplier: string;
  material: string;
  gpsStatus: string;
  distanceMeters: number;
  status: string;
  eta: string;
}

export interface InspectionRecord {
  id: string;
  project: string;
  supervisor: string;
  checklist: string;
  qualityRating: number;
  gpsCheckIn: string;
  signature: string;
  status: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actor: string;
  action: string;
  target: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  title: string;
  body: string;
  type: string;
  channel?: string;
  read: boolean;
  timestamp: string;
  link: string;
}

export interface AdminSessionRecord {
  id: string;
  admin: string;
  device: string;
  ip: string;
  status: string;
  lastSeen: string;
}

export interface SecurityEventRecord {
  id: string;
  event: string;
  actor: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ip: string;
  createdAt: string;
}

export interface UploadedDocumentRecord {
  id: string;
  entityType: string;
  entityId: string;
  name: string;
  fileType: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface AdminDashboardData {
  credentials: Array<{
    email: string;
    password: string;
    token: string;
    userId: string;
  }>;
  users: AdminUser[];
  kycDocuments: KycDocument[];
  projects: ProjectRecord[];
  transactions: TransactionRecord[];
  disputes: DisputeRecord[];
  rfqs: RfqRecord[];
  supplierQuotes: SupplierQuoteRecord[];
  deliveries: DeliveryRecord[];
  inspections: InspectionRecord[];
  auditLogs: AuditLogRecord[];
  notifications: NotificationRecord[];
  adminSessions: AdminSessionRecord[];
  securityEvents: SecurityEventRecord[];
  uploadedDocuments: UploadedDocumentRecord[];
  systemSettings: {
    rateLimit: string;
    jwtAccessExpiry: string;
    jwtRefreshExpiry: string;
    mtnSandbox: boolean;
    cloudinaryUploads: boolean;
    emailQueue: string;
    attackProtections: string[];
  };
}

export const formatRwf = (amount: number) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
