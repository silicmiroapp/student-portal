import { create } from 'zustand';
import type { DashboardData } from '@/types/dashboard';
import { dashboardApi } from './api';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardApi.getDashboard();
      set({ data, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load dashboard'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
