import { create } from 'zustand';
import type {
  UserRecord,
  SystemActivity,
  AdminLog,
  AdminStats,
} from '@/types/admin';
import type { FinancialPlan } from '@/types/finance';
import { adminApi } from './api';

interface AdminState {
  stats: AdminStats | null;
  users: UserRecord[];
  activity: SystemActivity[];
  logs: AdminLog[];
  studentFinance: FinancialPlan | null;

  isLoading: boolean;
  isToggling: string | null;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  fetchActivity: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchStudentFinance: (studentId: string) => Promise<void>;
  clearError: () => void;
  clearStudentFinance: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  users: [],
  activity: [],
  logs: [],
  studentFinance: null,

  isLoading: false,
  isToggling: null,
  error: null,

  fetchStats: async () => {
    try {
      const stats = await adminApi.getStats();
      set({ stats });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load admin stats') });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await adminApi.getUsers();
      set({ users, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load users'), isLoading: false });
    }
  },

  toggleUserStatus: async (userId: string) => {
    set({ isToggling: userId });
    try {
      const updated = await adminApi.toggleUserStatus(userId);
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? updated : u)),
        isToggling: null,
      }));
      // Refresh stats after toggle
      get().fetchStats();
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Failed to update user status'),
        isToggling: null,
      });
    }
  },

  fetchActivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const activity = await adminApi.getSystemActivity();
      set({ activity, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load system activity'), isLoading: false });
    }
  },

  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const logs = await adminApi.getAdminLogs();
      set({ logs, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load admin logs'), isLoading: false });
    }
  },

  fetchStudentFinance: async (studentId: string) => {
    set({ isLoading: true, error: null, studentFinance: null });
    try {
      const plan = await adminApi.getStudentFinance(studentId);
      set({ studentFinance: plan, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load student finance'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearStudentFinance: () => set({ studentFinance: null }),
}));
