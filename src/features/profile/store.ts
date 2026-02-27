import { create } from 'zustand';
import type { StudentProfile } from '@/types/profile';
import { profileApi } from './api';

interface ProfileState {
  profile: StudentProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileApi.getProfile();
      set({ profile, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load profile'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
