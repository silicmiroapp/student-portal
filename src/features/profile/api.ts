import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { StudentProfile } from '@/types/profile';
import { MOCK_PROFILE } from '@/mocks/profile';

const USE_MOCK = true;
const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async getProfile(): Promise<StudentProfile> {
    await delay(MOCK_DELAY);
    return MOCK_PROFILE;
  },
};

const realApi = {
  async getProfile(): Promise<StudentProfile> {
    const { data } = await api.get<StudentProfile>(ENDPOINTS.PROFILE);
    return data;
  },
};

export const profileApi = USE_MOCK ? mockApi : realApi;
