import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { DashboardData } from '@/types/dashboard';
import { MOCK_DASHBOARD } from '@/mocks/dashboard';

const USE_MOCK = true;
const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async getDashboard(): Promise<DashboardData> {
    await delay(MOCK_DELAY);
    return MOCK_DASHBOARD;
  },
};

const realApi = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>(ENDPOINTS.DASHBOARD);
    return data;
  },
};

export const dashboardApi = USE_MOCK ? mockApi : realApi;
