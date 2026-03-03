import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store';
import type { PermissionKey } from '@/types/rbac';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canActOnUser,
  canAssignRole,
  getAssignableRoles,
} from '@/services/rbac';
import type { UserRole, RoleDefinition } from '@/types/rbac';

/**
 * Check if the current user has a specific permission.
 * Returns a stable boolean — safe to use in conditionals and JSX.
 *
 * Usage:
 *   const canResetPassword = useHasPermission(Permission.USERS_RESET_PASSWORD);
 *   {canResetPassword && <ResetButton />}
 */
export function useHasPermission(permission: PermissionKey): boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => hasPermission(user, permission), [user, permission]);
}

/**
 * Check if the current user has ANY of the specified permissions.
 * Useful for showing UI sections visible to multiple roles.
 */
export function useHasAnyPermission(permissions: PermissionKey[]): boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => hasAnyPermission(user, permissions), [user, permissions]);
}

/**
 * Check if the current user has ALL of the specified permissions.
 */
export function useHasAllPermissions(permissions: PermissionKey[]): boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => hasAllPermissions(user, permissions), [user, permissions]);
}

/**
 * Check if the current user can perform actions on a target user.
 * Prevents horizontal/vertical privilege escalation in the UI.
 */
export function useCanActOnUser(targetRole: UserRole): boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => (user ? canActOnUser(user, targetRole) : false), [user, targetRole]);
}

/**
 * Check if the current user can assign a specific role to a target user.
 */
export function useCanAssignRole(targetUserId: string, newRole: UserRole): boolean {
  const user = useAuthStore((s) => s.user);
  return useMemo(
    () => (user ? canAssignRole(user, targetUserId, newRole) : false),
    [user, targetUserId, newRole]
  );
}

/**
 * Get list of roles the current user is allowed to assign.
 */
export function useAssignableRoles(): RoleDefinition[] {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => (user ? getAssignableRoles(user) : []), [user]);
}
