import { create } from 'zustand';
import type { Grade, GradeSummary } from '@/types/grades';
import { gradesApi } from './api';

interface GradesState {
  grades: Grade[];
  summary: GradeSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchGrades: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useGradesStore = create<GradesState>((set) => ({
  grades: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchGrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const { grades, summary } = await gradesApi.getGrades();
      set({ grades, summary, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load grades'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
