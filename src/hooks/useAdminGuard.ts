import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';
import { securityLog } from '@/services/securityLog';

/**
 * Guard hook for admin-only routes.
 * Redirects non-admin users to the dashboard and logs the attempt.
 * Returns true only when the current user has admin role.
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
