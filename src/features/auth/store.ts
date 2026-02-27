import { create } from 'zustand';
import { z } from 'zod';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from './api';
import { storage } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/api';
import { securityLog } from '@/services/securityLog';

// ── Session timeout configuration ──────────────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const SESSION_LAST_ACTIVE_KEY = 'session_last_active';

// ── Schema for validating stored user data on hydrate ──────────
// Prevents crashes from corrupted or tampered storage values.
const storedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  studentId: z.string().optional(),
  program: z.string().optional(),
  enrollmentYear: z.number().optional(),
  avatarUrl: z.string().url().optional(),
  lmsUsername: z.string().optional(),
});

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hydrate: () => Promise<void>;
  touchSession: () => void;
}

// Extract a readable message from any error shape
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

// Persist auth tokens and user data to secure storage
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

// Clear all auth data from secure storage
async function clearSession(): Promise<void> {
  await Promise.all([
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
    storage.remove(STORAGE_KEYS.USER_DATA),
    storage.remove(SESSION_LAST_ACTIVE_KEY),
  ]);
}

// Check if the session has expired due to inactivity
async function isSessionExpired(): Promise<boolean> {
  const lastActive = await storage.get(SESSION_LAST_ACTIVE_KEY);
  if (!lastActive) return false;

  const elapsed = Date.now() - Number(lastActive);
  return elapsed > SESSION_TIMEOUT_MS;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Restore session from secure storage on app launch
  hydrate: async () => {
    try {
      // Check session timeout first
      if (await isSessionExpired()) {
        securityLog.sessionExpired();
        await clearSession();
        set({ isLoading: false });
        return;
      }

      const [token, userData] = await Promise.all([
        storage.get(STORAGE_KEYS.ACCESS_TOKEN),
        storage.get(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        // Validate the stored data structure before trusting it
        const parsed = storedUserSchema.safeParse(JSON.parse(userData));
        if (!parsed.success) {
          securityLog.hydrateCorrupt();
          await clearSession();
          set({ isLoading: false });
          return;
        }

        set({
          user: parsed.data as User,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      securityLog.hydrateCorrupt();
      await clearSession();
    }

    set({ isLoading: false });
  },

  // Update last-active timestamp on user interaction
  touchSession: () => {
    storage.set(SESSION_LAST_ACTIVE_KEY, String(Date.now()));
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(data);
      await persistSession(res.accessToken, res.refreshToken, res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
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
      set({ user: res.user, isAuthenticated: true, isLoading: false });
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
    } finally {
      await clearSession();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      securityLog.logout();
    }
  },

  clearError: () => set({ error: null }),
}));
