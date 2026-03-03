import {
  Permission,
  ROLE_DEFINITIONS,
  type PermissionKey,
  type UserRole,
  type RoleDefinition,
} from '@/types/rbac';
import type { User } from '@/types/auth';

// ─── Permission Checking ─────────────────────────────────────
// All authorization decisions flow through these functions.
// They check the user's permission ARRAY, never the role name.
// This means custom per-user permissions work automatically.

/**
 * Check if a user has a specific permission.
 * This is THE primary authorization check — every guard and
 * middleware call should resolve to this function.
 */
export function hasPermission(user: User | null, permission: PermissionKey): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if a user has ALL of the specified permissions.
 * Use for actions that require multiple capabilities.
 */
export function hasAllPermissions(user: User | null, permissions: PermissionKey[]): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if a user has ANY of the specified permissions.
 * Use for UI elements visible to multiple roles with different permissions.
 */
export function hasAnyPermission(user: User | null, permissions: PermissionKey[]): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Check if a user has any admin-level role (non-user).
 * Use ONLY for UI decisions like showing the admin tab.
 * Never use this for authorization — use permission checks instead.
 */
export function isAdminRole(user: User | null): boolean {
  if (!user) return false;
  return user.role !== 'user';
}

// ─── Role Resolution ─────────────────────────────────────────

/**
 * Get the role definition for a given role name.
 */
export function getRoleDefinition(role: UserRole): RoleDefinition {
  return ROLE_DEFINITIONS[role];
}

/**
 * Get the default permissions for a role.
 * Used by the mock API and as a client-side reference.
 * The server is always the source of truth for actual permissions.
 */
export function getDefaultPermissions(role: UserRole): PermissionKey[] {
  return [...ROLE_DEFINITIONS[role].permissions];
}

/**
 * Get the privilege level for a role.
 * Higher number = more privileged.
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_DEFINITIONS[role].level;
}

// ─── Privilege Escalation Prevention ─────────────────────────
// These functions enforce the rule that a user cannot grant
// permissions or roles beyond their own privilege level.

/**
 * Check if the actor can assign a role to a target.
 * Rules:
 * 1. Only users with USERS_ASSIGN_ROLE permission can assign roles
 * 2. The actor cannot assign a role with a higher privilege level than their own
 * 3. The actor cannot change their own role
 */
export function canAssignRole(actor: User, targetUserId: string, newRole: UserRole): boolean {
  // Must have the assign_role permission
  if (!hasPermission(actor, Permission.USERS_ASSIGN_ROLE)) return false;

  // Cannot modify own role (prevents self-elevation)
  if (actor.id === targetUserId) return false;

  // Cannot assign a role with higher privilege than own
  const actorLevel = getRoleLevel(actor.role);
  const targetLevel = getRoleLevel(newRole);
  return actorLevel > targetLevel;
}

/**
 * Check if the actor can perform actions on a target user.
 * Prevents horizontal privilege escalation (admin modifying another admin)
 * and vertical escalation (lower role modifying higher role).
 */
export function canActOnUser(actor: User, targetRole: UserRole): boolean {
  const actorLevel = getRoleLevel(actor.role);
  const targetLevel = getRoleLevel(targetRole);

  // Can only act on users with strictly lower privilege level
  return actorLevel > targetLevel;
}

/**
 * Get list of roles that the actor is allowed to assign.
 * Filters out roles at or above the actor's level.
 */
export function getAssignableRoles(actor: User): RoleDefinition[] {
  if (!hasPermission(actor, Permission.USERS_ASSIGN_ROLE)) return [];

  const actorLevel = getRoleLevel(actor.role);
  return Object.values(ROLE_DEFINITIONS)
    .filter((role) => role.level < actorLevel)
    .sort((a, b) => b.level - a.level);
}

// ─── Admin Session Configuration ─────────────────────────────
// Admin roles get shorter session timeouts for security.

const SESSION_TIMEOUT_BY_ROLE: Record<UserRole, number> = {
  super_admin: 15 * 60 * 1000,  // 15 minutes
  admin:       20 * 60 * 1000,  // 20 minutes
  support_admin: 20 * 60 * 1000,// 20 minutes
  user:        30 * 60 * 1000,  // 30 minutes (existing behavior)
};

/**
 * Get the session timeout for a role.
 * Admin roles have shorter timeouts for security.
 */
export function getSessionTimeout(role: UserRole): number {
  return SESSION_TIMEOUT_BY_ROLE[role];
}

// ─── Permission Grouping (for UI display) ────────────────────

export interface PermissionGroup {
  label: string;
  permissions: { key: PermissionKey; label: string }[];
}

export function getPermissionGroups(): PermissionGroup[] {
  return [
    {
      label: 'User Management',
      permissions: [
        { key: Permission.USERS_VIEW, label: 'View users' },
        { key: Permission.USERS_CREATE, label: 'Create users' },
        { key: Permission.USERS_UPDATE, label: 'Update users' },
        { key: Permission.USERS_DEACTIVATE, label: 'Deactivate accounts' },
        { key: Permission.USERS_SUSPEND, label: 'Suspend accounts' },
        { key: Permission.USERS_LOCK, label: 'Lock accounts' },
        { key: Permission.USERS_UNLOCK, label: 'Unlock accounts' },
        { key: Permission.USERS_RESET_PASSWORD, label: 'Reset passwords' },
        { key: Permission.USERS_FORCE_PWD_CHANGE, label: 'Force password change' },
        { key: Permission.USERS_EDIT_PROFILE, label: 'Edit user profiles' },
        { key: Permission.USERS_VIEW_LOGIN_HISTORY, label: 'View login history' },
        { key: Permission.USERS_ASSIGN_ROLE, label: 'Assign roles' },
      ],
    },
    {
      label: 'Security',
      permissions: [
        { key: Permission.SECURITY_REVOKE_SESSION, label: 'Revoke sessions' },
        { key: Permission.SECURITY_FORCE_LOGOUT, label: 'Force logout' },
        { key: Permission.SECURITY_MANAGE_2FA, label: 'Manage 2FA' },
        { key: Permission.SECURITY_VIEW_SUSPICIOUS, label: 'View suspicious logins' },
        { key: Permission.SECURITY_PASSWORD_POLICY, label: 'Manage password policy' },
      ],
    },
    {
      label: 'Monitoring & Logs',
      permissions: [
        { key: Permission.LOGS_VIEW_ADMIN_ACTIONS, label: 'View admin action logs' },
        { key: Permission.LOGS_VIEW_USER_ACTIVITY, label: 'View user activity' },
        { key: Permission.LOGS_VIEW_AUDIT_TRAIL, label: 'View audit trail' },
        { key: Permission.LOGS_VIEW_ERRORS, label: 'View error logs' },
        { key: Permission.LOGS_VIEW_ROLE_CHANGES, label: 'View role changes' },
      ],
    },
    {
      label: 'Communication',
      permissions: [
        { key: Permission.COMM_SEND_PUSH, label: 'Send push notifications' },
        { key: Permission.COMM_SEND_ANNOUNCEMENT, label: 'Send announcements' },
        { key: Permission.COMM_SEND_DIRECT_MSG, label: 'Send direct messages' },
      ],
    },
    {
      label: 'System',
      permissions: [
        { key: Permission.SYSTEM_MANAGE_SETTINGS, label: 'Manage settings' },
        { key: Permission.SYSTEM_FEATURE_FLAGS, label: 'Manage feature flags' },
        { key: Permission.SYSTEM_MAINTENANCE_MODE, label: 'Toggle maintenance mode' },
        { key: Permission.SYSTEM_CONFIGURATION, label: 'System configuration' },
        { key: Permission.SYSTEM_MANAGE_BRANDING, label: 'Manage branding' },
      ],
    },
    {
      label: 'Finance',
      permissions: [
        { key: Permission.FINANCE_VIEW_STUDENT, label: 'View student finance' },
        { key: Permission.FINANCE_MANAGE, label: 'Manage finance' },
      ],
    },
  ];
}
