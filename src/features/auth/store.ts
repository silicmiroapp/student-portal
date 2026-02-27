import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from './api';
import { storage } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants/api';

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
  ]);
}

// Clear all auth data from secure storage
async function clearSession(): Promise<void> {
  await Promise.all([
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
    storage.remove(STORAGE_KEYS.USER_DATA),
  ]);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Restore session from secure storage on app launch
  hydrate: async () => {
    try {
      const [token, userData] = await Promise.all([
        storage.get(STORAGE_KEYS.ACCESS_TOKEN),
        storage.get(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        set({
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Corrupted storage — clear it
      await clearSession();
    }

    set({ isLoading: false });
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(data);
      await persistSession(res.accessToken, res.refreshToken, res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Login failed. Please try again.'),
        isLoading: false,
      });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(data);
      await persistSession(res.accessToken, res.refreshToken, res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Registration failed. Please try again.'),
        isLoading: false,
      });
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
    }
  },

  clearError: () => set({ error: null }),
}));
