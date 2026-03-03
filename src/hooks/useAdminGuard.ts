import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';
import { securityLog } from '@/services/securityLog';
import type { PermissionKey } from '@/types/rbac';
import { hasPermission } from '@/services/rbac';

/**
 * Guard hook for admin-only routes.
 * Redirects non-admin users to the dashboard and logs the attempt.
 * Returns true only when the current user has an admin-level role.
 *
 * This is a backward-compatible wrapper. For fine-grained permission
 * checks, use usePermissionGuard() instead.
 */
export function useAdminGuard(): boolean {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!isAdmin) {
      securityLog.adminUnauthorizedAccess(
        user?.email ?? 'unknown',
        'admin_dashboard'
      );
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated, isAdmin, user, router]);

  return isAdmin;
}

/**
 * Guard hook that checks for a specific permission.
 * Redirects unauthorized users and logs the attempt.
 *
 * Usage:
 *   const allowed = usePermissionGuard(Permission.SYSTEM_MANAGE_SETTINGS, 'system_settings');
 *   if (!allowed) return null; // guard will redirect
 */
export function usePermissionGuard(
  permission: PermissionKey,
  pageName: string
): boolean {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const allowed = user ? hasPermission(user, permission) : false;

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!allowed) {
      securityLog.adminUnauthorizedAccess(
        user?.email ?? 'unknown',
        pageName
      );
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated, allowed, user, router, pageName]);

  return allowed;
}
