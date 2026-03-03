import { create } from 'zustand';
import { z } from 'zod';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';
import type { PermissionKey } from '@/types/rbac';
import { authApi } from './api';
import { storage } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/api';
import { securityLog } from '@/services/securityLog';
import {
  hasPermission,
  hasAnyPermission,
  isAdminRole,
  getSessionTimeout,
} from '@/services/rbac';

// ── Session timeout configuration ──────────────────────────────
// Default timeout; overridden per-role after login.
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_LAST_ACTIVE_KEY = 'session_last_active';

// ── Schema for validating stored user data on hydrate ──────────
// Prevents crashes from corrupted or tampered storage values.
// SECURITY: The role and permissions fields are validated here but
// MUST originate from the server. The client never self-assigns roles.
const VALID_ROLES = ['super_admin', 'admin', 'support_admin', 'user'] as const;

const storedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(VALID_ROLES).catch('user'),
  permissions: z.array(z.string()).catch([]),
  studentId: z.string().optional(),
  program: z.string().optional(),
  enrollmentYear: z.number().optional(),
  avatarUrl: z.string().url().optional(),
  lmsUsername: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True if the user has any admin-level role. Use for UI visibility only. */
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hydrate: () => Promise<void>;
  touchSession: () => void;

  // ── Permission-aware accessors ───────────────────────────
  /** Check if the current user has a specific permission. */
  checkPermission: (permission: PermissionKey) => boolean;
  /** Check if the current user has any of the given permissions. */
  checkAnyPermission: (permissions: PermissionKey[]) => boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

async function persistSession(
  accessToken: string,
  refreshToken: string,
  user: User
): Promise<void> {
  await Promise.all([
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
    storage.set(SESSION_LAST_ACTIVE_KEY, String(Date.now())),
  ]);
}

async function clearSession(): Promise<void> {
  await Promise.all([
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
    storage.remove(STORAGE_KEYS.USER_DATA),
    storage.remove(SESSION_LAST_ACTIVE_KEY),
  ]);
}

async function isSessionExpired(role?: string): Promise<boolean> {
  const lastActive = await storage.get(SESSION_LAST_ACTIVE_KEY);
  if (!lastActive) return false;

  const elapsed = Date.now() - Number(lastActive);
  const timeout = role
    ? getSessionTimeout(role as User['role'])
    : DEFAULT_SESSION_TIMEOUT_MS;

  return elapsed > timeout;
}

function deriveAdminState(user: User) {
  return {
    user,
    isAuthenticated: true,
    isAdmin: isAdminRole(user),
    isLoading: false,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  error: null,

  // ── Permission accessors ─────────────────────────────────
  checkPermission: (permission: PermissionKey): boolean => {
    return hasPermission(get().user, permission);
  },

  checkAnyPermission: (permissions: PermissionKey[]): boolean => {
    return hasAnyPermission(get().user, permissions);
  },

  // ── Restore session from secure storage on app launch ────
  hydrate: async () => {
    try {
      const userData = await storage.get(STORAGE_KEYS.USER_DATA);
      const parsedUser = userData
        ? storedUserSchema.safeParse(JSON.parse(userData))
        : null;

      // Check session timeout using role-specific duration
      if (
        parsedUser?.success &&
        (await isSessionExpired(parsedUser.data.role))
      ) {
        securityLog.sessionExpired();
        await clearSession();
        set({ isLoading: false });
        return;
      }

      const token = await storage.get(STORAGE_KEYS.ACCESS_TOKEN);

      if (token && parsedUser?.success) {
        const user = parsedUser.data as User;
        set(deriveAdminState(user));
        return;
      }

      if (token || userData) {
        // Partial data — something is corrupt
        securityLog.hydrateCorrupt();
        await clearSession();
      }
    } catch {
      securityLog.hydrateCorrupt();
      await clearSession();
    }

    set({ isLoading: false });
  },

  touchSession: () => {
    storage.set(SESSION_LAST_ACTIVE_KEY, String(Date.now()));
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(data);
      await persistSession(res.accessToken, res.refreshToken, res.user);
      set({ ...deriveAdminState(res.user) });
      securityLog.loginSuccess(data.email);
    } catch (err) {
      const msg = getErrorMessage(err, 'Login failed. Please try again.');
      securityLog.loginFailure(data.email, msg);
      set({ error: msg, isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(data);
      await persistSession(res.accessToken, res.refreshToken, res.user);
      set({ ...deriveAdminState(res.user) });
      securityLog.registerSuccess(data.email);
    } catch (err) {
      const msg = getErrorMessage(err, 'Registration failed. Please try again.');
      securityLog.registerFailure(data.email, msg);
      set({ error: msg, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Logout API failure is non-critical — still clear local session
    }

    // Unregister push token — import dynamically to avoid circular deps
    try {
      const { useNotificationStore } = await import('@/features/notifications/store');
      await useNotificationStore.getState().unregisterDevice();
    } catch {
      // Non-critical — token will be invalidated server-side eventually
    }

    await clearSession();
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
    securityLog.logout();
  },

  clearError: () => set({ error: null }),
}));
