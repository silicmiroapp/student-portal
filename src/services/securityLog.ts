import { ENV } from '@/config/env';
import type { UserRole, AuditAction } from '@/types/rbac';

type SecurityEvent =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_REGISTER_SUCCESS'
  | 'AUTH_REGISTER_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_TOKEN_REFRESH_FAILURE'
  | 'AUTH_HYDRATE_CORRUPT'
  | 'AUTH_RATE_LIMITED'
  | 'STORAGE_PARSE_ERROR'
  | 'ADMIN_ACCESS'
  | 'ADMIN_USER_MODIFIED'
  | 'ADMIN_FINANCE_VIEWED'
  | 'ADMIN_UNAUTHORIZED_ACCESS'
  // New RBAC events
  | 'ADMIN_PASSWORD_RESET'
  | 'ADMIN_ROLE_CHANGED'
  | 'ADMIN_SESSION_REVOKED'
  | 'ADMIN_USER_LOCKED'
  | 'ADMIN_USER_UNLOCKED'
  | 'ADMIN_USER_SUSPENDED'
  | 'ADMIN_FORCE_LOGOUT'
  | 'ADMIN_2FA_TOGGLED'
  | 'ADMIN_SYSTEM_SETTINGS_CHANGED'
  | 'ADMIN_MAINTENANCE_TOGGLED'
  | 'ADMIN_FEATURE_FLAG_TOGGLED'
  | 'ADMIN_NOTIFICATION_SENT'
  | 'ADMIN_ANNOUNCEMENT_SENT'
  | 'ADMIN_PRIVILEGE_ESCALATION_BLOCKED';

// Security-safe metadata — NEVER include passwords, tokens, or PII
interface LogMeta {
  /** Masked email: j***@example.com */
  email?: string;
  reason?: string;
  attempts?: number;
  adminId?: string;
  adminRole?: UserRole;
  action?: AuditAction | string;
  targetUserId?: string;
  page?: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length > 1 ? local[0] + '***' : '***';
  return `${masked}@${domain}`;
}

function logSecurityEvent(event: SecurityEvent, meta?: LogMeta): void {
  if (!ENV.ENABLE_SECURITY_LOG) return;

  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...(meta ?? {}),
  };

  // In production, replace console.info with your logging service
  // (e.g., Sentry, Datadog, CloudWatch)
  console.info('[SECURITY]', JSON.stringify(entry));
}

export const securityLog = {
  // ── Auth events ──────────────────────────────────────────
  loginSuccess: (email: string) =>
    logSecurityEvent('AUTH_LOGIN_SUCCESS', { email: maskEmail(email) }),

  loginFailure: (email: string, reason: string) =>
    logSecurityEvent('AUTH_LOGIN_FAILURE', { email: maskEmail(email), reason }),

  registerSuccess: (email: string) =>
    logSecurityEvent('AUTH_REGISTER_SUCCESS', { email: maskEmail(email) }),

  registerFailure: (email: string, reason: string) =>
    logSecurityEvent('AUTH_REGISTER_FAILURE', { email: maskEmail(email), reason }),

  logout: () =>
    logSecurityEvent('AUTH_LOGOUT'),

  sessionExpired: () =>
    logSecurityEvent('AUTH_SESSION_EXPIRED'),

  tokenRefresh: () =>
    logSecurityEvent('AUTH_TOKEN_REFRESH'),

  tokenRefreshFailure: (reason: string) =>
    logSecurityEvent('AUTH_TOKEN_REFRESH_FAILURE', { reason }),

  hydrateCorrupt: () =>
    logSecurityEvent('AUTH_HYDRATE_CORRUPT'),

  rateLimited: (email: string, attempts: number) =>
    logSecurityEvent('AUTH_RATE_LIMITED', { email: maskEmail(email), attempts }),

  storageParseError: (reason: string) =>
    logSecurityEvent('STORAGE_PARSE_ERROR', { reason }),

  // ── Admin events (existing, backward-compatible) ─────────
  adminAccess: (adminId: string, page: string) =>
    logSecurityEvent('ADMIN_ACCESS', { adminId, page }),

  adminUserModified: (adminId: string, action: string, targetUserId: string) =>
    logSecurityEvent('ADMIN_USER_MODIFIED', { adminId, action, targetUserId }),

  adminFinanceViewed: (adminId: string, targetUserId: string) =>
    logSecurityEvent('ADMIN_FINANCE_VIEWED', { adminId, targetUserId }),

  adminUnauthorizedAccess: (email: string, page: string) =>
    logSecurityEvent('ADMIN_UNAUTHORIZED_ACCESS', { email: maskEmail(email), page }),

  // ── RBAC-specific events ─────────────────────────────────

  adminPasswordReset: (adminId: string, adminRole: UserRole, targetUserId: string) =>
    logSecurityEvent('ADMIN_PASSWORD_RESET', { adminId, adminRole, targetUserId }),

  adminRoleChanged: (
    adminId: string,
    adminRole: UserRole,
    targetUserId: string,
    previousValue: string,
    newValue: string
  ) =>
    logSecurityEvent('ADMIN_ROLE_CHANGED', {
      adminId,
      adminRole,
      targetUserId,
      previousValue,
      newValue,
    }),

  adminSessionRevoked: (adminId: string, adminRole: UserRole, targetUserId: string) =>
    logSecurityEvent('ADMIN_SESSION_REVOKED', { adminId, adminRole, targetUserId }),

  adminUserLocked: (adminId: string, adminRole: UserRole, targetUserId: string) =>
    logSecurityEvent('ADMIN_USER_LOCKED', { adminId, adminRole, targetUserId }),

  adminUserUnlocked: (adminId: string, adminRole: UserRole, targetUserId: string) =>
    logSecurityEvent('ADMIN_USER_UNLOCKED', { adminId, adminRole, targetUserId }),

  adminUserSuspended: (adminId: string, adminRole: UserRole, targetUserId: string, reason: string) =>
    logSecurityEvent('ADMIN_USER_SUSPENDED', { adminId, adminRole, targetUserId, reason }),

  adminForceLogout: (adminId: string, adminRole: UserRole, targetUserId: string) =>
    logSecurityEvent('ADMIN_FORCE_LOGOUT', { adminId, adminRole, targetUserId }),

  admin2FAToggled: (adminId: string, adminRole: UserRole, targetUserId: string, newValue: string) =>
    logSecurityEvent('ADMIN_2FA_TOGGLED', { adminId, adminRole, targetUserId, newValue }),

  adminSystemSettingsChanged: (adminId: string, adminRole: UserRole, action: string) =>
    logSecurityEvent('ADMIN_SYSTEM_SETTINGS_CHANGED', { adminId, adminRole, action }),

  adminMaintenanceToggled: (adminId: string, adminRole: UserRole, newValue: string) =>
    logSecurityEvent('ADMIN_MAINTENANCE_TOGGLED', { adminId, adminRole, newValue }),

  adminFeatureFlagToggled: (adminId: string, adminRole: UserRole, action: string) =>
    logSecurityEvent('ADMIN_FEATURE_FLAG_TOGGLED', { adminId, adminRole, action }),

  adminNotificationSent: (adminId: string, adminRole: UserRole, action: string) =>
    logSecurityEvent('ADMIN_NOTIFICATION_SENT', { adminId, adminRole, action }),

  adminAnnouncementSent: (adminId: string, adminRole: UserRole, action: string) =>
    logSecurityEvent('ADMIN_ANNOUNCEMENT_SENT', { adminId, adminRole, action }),

  /** Log when a privilege escalation attempt is blocked */
  privilegeEscalationBlocked: (
    adminId: string,
    adminRole: UserRole,
    action: string,
    targetUserId?: string
  ) =>
    logSecurityEvent('ADMIN_PRIVILEGE_ESCALATION_BLOCKED', {
      adminId,
      adminRole,
      action,
      targetUserId,
    }),
};
