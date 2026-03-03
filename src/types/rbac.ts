// ─── Permission Definitions ──────────────────────────────────
// Every permission is a structured string: "domain.action"
// Authorization checks use these constants — NEVER raw strings.

export const Permission = {
  // ── User Management ──────────────────────────────────────
  USERS_VIEW:              'users.view',
  USERS_CREATE:            'users.create',
  USERS_UPDATE:            'users.update',
  USERS_DEACTIVATE:        'users.deactivate',
  USERS_SUSPEND:           'users.suspend',
  USERS_LOCK:              'users.lock',
  USERS_UNLOCK:            'users.unlock',
  USERS_RESET_PASSWORD:    'users.reset_password',
  USERS_FORCE_PWD_CHANGE:  'users.force_password_change',
  USERS_EDIT_PROFILE:      'users.edit_profile',
  USERS_VIEW_LOGIN_HISTORY:'users.view_login_history',
  USERS_ASSIGN_ROLE:       'users.assign_role',

  // ── Security Controls ────────────────────────────────────
  SECURITY_REVOKE_SESSION: 'security.revoke_session',
  SECURITY_FORCE_LOGOUT:   'security.force_logout',
  SECURITY_MANAGE_2FA:     'security.manage_2fa',
  SECURITY_VIEW_SUSPICIOUS:'security.view_suspicious_logins',
  SECURITY_PASSWORD_POLICY:'security.enforce_password_policy',

  // ── Monitoring & Logs ────────────────────────────────────
  LOGS_VIEW_ADMIN_ACTIONS: 'logs.view_admin_actions',
  LOGS_VIEW_USER_ACTIVITY: 'logs.view_user_activity',
  LOGS_VIEW_AUDIT_TRAIL:   'logs.view_audit_trail',
  LOGS_VIEW_ERRORS:        'logs.view_errors',
  LOGS_VIEW_ROLE_CHANGES:  'logs.view_role_changes',

  // ── Communication ────────────────────────────────────────
  COMM_SEND_PUSH:          'communication.send_push',
  COMM_SEND_ANNOUNCEMENT:  'communication.send_announcement',
  COMM_SEND_DIRECT_MSG:    'communication.send_direct_message',

  // ── System Controls (SuperAdmin only) ────────────────────
  SYSTEM_MANAGE_SETTINGS:  'system.manage_settings',
  SYSTEM_FEATURE_FLAGS:    'system.feature_flags',
  SYSTEM_MAINTENANCE_MODE: 'system.maintenance_mode',
  SYSTEM_CONFIGURATION:    'system.configuration',
  SYSTEM_MANAGE_BRANDING:  'system.manage_branding',

  // ── Finance ──────────────────────────────────────────────
  FINANCE_VIEW_STUDENT:    'finance.view_student_data',
  FINANCE_MANAGE:          'finance.manage',
} as const;

export type PermissionKey = typeof Permission[keyof typeof Permission];

// ─── Role Definitions ────────────────────────────────────────
// Roles are named collections of permissions.
// The role name is informational — all access decisions use permissions.

export type UserRole = 'super_admin' | 'admin' | 'support_admin' | 'user';

export interface RoleDefinition {
  name: UserRole;
  label: string;
  description: string;
  permissions: PermissionKey[];
  /** Higher = more privileged. Used to prevent privilege escalation. */
  level: number;
}

// ─── Role → Permission Mappings ──────────────────────────────
// These define the DEFAULT permissions for each role.
// The server may override per-user, but these serve as the
// reference model and client-side fallback for mock mode.

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  super_admin: {
    name: 'super_admin',
    label: 'Super Admin',
    description: 'Full system control. Can assign roles and modify system settings.',
    level: 100,
    permissions: Object.values(Permission), // All permissions
  },

  admin: {
    name: 'admin',
    label: 'Admin',
    description: 'Manage users, content, and communications. No system configuration access.',
    level: 50,
    permissions: [
      // User Management
      Permission.USERS_VIEW,
      Permission.USERS_CREATE,
      Permission.USERS_UPDATE,
      Permission.USERS_DEACTIVATE,
      Permission.USERS_SUSPEND,
      Permission.USERS_LOCK,
      Permission.USERS_UNLOCK,
      Permission.USERS_RESET_PASSWORD,
      Permission.USERS_FORCE_PWD_CHANGE,
      Permission.USERS_EDIT_PROFILE,
      Permission.USERS_VIEW_LOGIN_HISTORY,

      // Security (limited)
      Permission.SECURITY_REVOKE_SESSION,
      Permission.SECURITY_FORCE_LOGOUT,
      Permission.SECURITY_MANAGE_2FA,
      Permission.SECURITY_VIEW_SUSPICIOUS,

      // Logs (limited)
      Permission.LOGS_VIEW_ADMIN_ACTIONS,
      Permission.LOGS_VIEW_USER_ACTIVITY,
      Permission.LOGS_VIEW_AUDIT_TRAIL,

      // Communication (full)
      Permission.COMM_SEND_PUSH,
      Permission.COMM_SEND_ANNOUNCEMENT,
      Permission.COMM_SEND_DIRECT_MSG,

      // Finance (view only)
      Permission.FINANCE_VIEW_STUDENT,
    ],
  },

  support_admin: {
    name: 'support_admin',
    label: 'Support Admin',
    description: 'Help desk operations. Password resets, account unlocks, session management.',
    level: 25,
    permissions: [
      // User Management (limited)
      Permission.USERS_VIEW,
      Permission.USERS_UNLOCK,
      Permission.USERS_RESET_PASSWORD,
      Permission.USERS_FORCE_PWD_CHANGE,
      Permission.USERS_VIEW_LOGIN_HISTORY,

      // Security (limited)
      Permission.SECURITY_REVOKE_SESSION,
      Permission.SECURITY_FORCE_LOGOUT,
      Permission.SECURITY_VIEW_SUSPICIOUS,

      // Logs (view only)
      Permission.LOGS_VIEW_USER_ACTIVITY,
      Permission.LOGS_VIEW_AUDIT_TRAIL,
    ],
  },

  user: {
    name: 'user',
    label: 'User',
    description: 'Regular student user with no administrative access.',
    level: 0,
    permissions: [],
  },
} as const;

// ─── Audit Log Types ─────────────────────────────────────────

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deactivated'
  | 'user.activated'
  | 'user.suspended'
  | 'user.locked'
  | 'user.unlocked'
  | 'user.password_reset'
  | 'user.force_password_change'
  | 'user.profile_edited'
  | 'user.role_changed'
  | 'session.revoked'
  | 'session.force_logout'
  | 'security.2fa_toggled'
  | 'security.password_policy_changed'
  | 'communication.push_sent'
  | 'communication.announcement_sent'
  | 'communication.direct_message_sent'
  | 'system.settings_changed'
  | 'system.feature_flag_toggled'
  | 'system.maintenance_mode_toggled'
  | 'system.configuration_changed'
  | 'admin.access'
  | 'admin.unauthorized_access'
  | 'finance.viewed';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  targetUserId?: string;
  targetEmail?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  /** Previous value for change tracking */
  previousValue?: string;
  /** New value for change tracking */
  newValue?: string;
}

// ─── System Settings Types ───────────────────────────────────

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  featureFlags: Record<string, boolean>;
  passwordPolicy: PasswordPolicy;
  sessionTimeoutMinutes: number;
  adminSessionTimeoutMinutes: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAgeDays: number;
  preventReuse: number;
}

// ─── Communication Types ─────────────────────────────────────

export interface PushNotificationRequest {
  title: string;
  body: string;
  /** 'all' or array of user IDs */
  recipients: 'all' | string[];
  /** Optional data payload */
  data?: Record<string, string>;
}

export interface AnnouncementRequest {
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
}

export interface DirectMessageRequest {
  recipientId: string;
  subject: string;
  body: string;
}
