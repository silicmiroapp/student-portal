import { create } from 'zustand';
import type { ExamSchedule } from '@/types/grades';
import { scheduleApi } from './api';

interface ScheduleState {
  exams: ExamSchedule[];
  isLoading: boolean;
  error: string | null;

  fetchExams: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  exams: [],
  isLoading: false,
  error: null,

  fetchExams: async () => {
    set({ isLoading: true, error: null });
    try {
      const exams = await scheduleApi.getExams();
      set({ exams, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load exam schedule'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
