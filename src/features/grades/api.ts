import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { Grade, GradeSummary } from '@/types/grades';
import { MOCK_GRADES, MOCK_GRADE_SUMMARY } from '@/mocks/grades';

const USE_MOCK = true;
const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GradesResponse {
  grades: Grade[];
  summary: GradeSummary;
}

const mockApi = {
  async getGrades(): Promise<GradesResponse> {
    await delay(MOCK_DELAY);
    return { grades: MOCK_GRADES, summary: MOCK_GRADE_SUMMARY };
  },
};

const realApi = {
  async getGrades(): Promise<GradesResponse> {
    const { data } = await api.get<GradesResponse>(ENDPOINTS.GRADES);
    return data;
  },
};

export const gradesApi = USE_MOCK ? mockApi : realApi;
