import type { UserRole, PermissionKey, AuditLogEntry } from './rbac';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: PermissionKey[];
  studentId?: string;
  program?: string;
  isActive: boolean;
  isLocked: boolean;
  isSuspended: boolean;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type ActivityType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired'
  | 'password_reset'
  | 'password_changed'
  | 'role_changed'
  | 'account_locked'
  | 'account_unlocked'
  | 'session_revoked';

export interface SystemActivity {
  id: string;
  type: ActivityType;
  userId?: string;
  email: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// Backward-compatible alias — existing code that uses AdminLog continues to work.
// New code should prefer AuditLogEntry from rbac.ts for richer audit data.
export type AdminLog = AuditLogEntry;

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  lockedUsers: number;
  suspendedUsers: number;
  recentLogins24h: number;
  failedLogins24h: number;
  adminActions7d: number;
  roleDistribution: Record<UserRole, number>;
}

// ── Admin Action Requests ────────────────────────────────────

export interface ResetPasswordRequest {
  userId: string;
  /** If true, send notification email to user */
  notifyUser: boolean;
  /** Temporary password (server may generate if omitted) */
  temporaryPassword?: string;
}

export interface ChangeRoleRequest {
  userId: string;
  newRole: UserRole;
  reason: string;
}

export interface SuspendUserRequest {
  userId: string;
  reason: string;
  /** Optional: auto-unsuspend date */
  until?: string;
}

export interface SendAnnouncementRequest {
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipients: 'all' | string[];
}

export interface SendNotificationRequest {
  title: string;
  body: string;
  recipients: 'all' | string[];
}
