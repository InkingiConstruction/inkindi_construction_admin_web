/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : mockAdminService.ts
 * WHAT THIS FILE DOES : Provides typed access to local mock admin portal data
 * HOW IT DOES IT      : Loads JSON from public assets and exposes small helpers
 * DATA SOURCE         : public/mock-admin-data.json
 * DATA DESTINATION    : Admin dashboard components and auth mock login
 * PRINCIPLE APPLIED   : DRY
 * ============================================================================
 */

import type { User } from '../shared/types';

export type AdminRole = 'ADMIN' | 'CLIENT' | 'ENGINEER' | 'SUPERVISOR' | 'SUPPLIER';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MockUser extends User {
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
  title: string;
  body: string;
  type: string;
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

export interface MockAdminData {
  credentials: Array<{
    email: string;
    password: string;
    token: string;
    userId: string;
  }>;
  users: MockUser[];
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

let cachedData: MockAdminData | null = null;

/**
 * ============================================================================
 * FUNCTION: getMockAdminData
 * ============================================================================
 * WHAT IT DOES: Loads and caches the complete mock admin dataset
 * PARAMETERS: none
 * RETURNS: Promise<MockAdminData> - Typed admin mock data
 * WHO CALLS IT: AuthContext helpers and AdminOperationsPage
 * PRINCIPLE: DRY
 * ============================================================================
 */
export const getMockAdminData = async (): Promise<MockAdminData> => {
  if (cachedData) return cachedData;

  const response = await fetch('/mock-admin-data.json', {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load mock admin data');
  }

  cachedData = await response.json() as MockAdminData;
  return cachedData;
};

/**
 * ============================================================================
 * FUNCTION: authenticateMockAdmin
 * ============================================================================
 * WHAT IT DOES: Authenticates mock users and allows only active ADMIN accounts
 * PARAMETERS:
 *   - email (string) : Login email entered by admin
 *   - password (string) : Login password entered by admin
 * RETURNS: Promise<{ token: string; user: MockUser }> - Mock auth session data
 * WHO CALLS IT: useLogin hook
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export const authenticateMockAdmin = async (email: string, password: string) => {
  const data = await getMockAdminData();
  const normalizedEmail = email.trim().toLowerCase();
  const credential = data.credentials.find(
    item => item.email.toLowerCase() === normalizedEmail && item.password === password
  );

  if (!credential) {
    throw new Error('Invalid admin credentials for mock mode.');
  }

  const user = data.users.find(item => item.id === credential.userId);
  if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
    throw new Error('This account is not allowed to access the admin portal.');
  }

  return {
    token: credential.token,
    user,
  };
};

/**
 * ============================================================================
 * FUNCTION: formatRwf
 * ============================================================================
 * WHAT IT DOES: Formats numeric money values as Rwandan Franc currency
 * PARAMETERS:
 *   - amount (number) : Raw amount in RWF
 * RETURNS: string - Localized RWF currency string
 * WHO CALLS IT: Admin dashboard table and stat components
 * PRINCIPLE: DRY
 * ============================================================================
 */
export const formatRwf = (amount: number) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * ============================================================================
 * FUNCTION: formatDate
 * ============================================================================
 * WHAT IT DOES: Formats ISO date strings for admin display
 * PARAMETERS:
 *   - value (string) : ISO date string
 * RETURNS: string - Human-readable date
 * WHO CALLS IT: Admin dashboard table and modal components
 * PRINCIPLE: DRY
 * ============================================================================
 */
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
