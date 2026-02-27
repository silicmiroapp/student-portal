import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type { ExamSchedule } from '@/types/grades';
import { MOCK_EXAMS } from '@/mocks/grades';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async getExams(): Promise<ExamSchedule[]> {
    await delay(MOCK_DELAY);
    return MOCK_EXAMS;
  },
};

const realApi = {
  async getExams(): Promise<ExamSchedule[]> {
    const { data } = await api.get<{ exams: ExamSchedule[] }>(ENDPOINTS.SCHEDULE.EXAMS);
    return data.exams;
  },
};

export const scheduleApi = ENV.USE_MOCK_API ? mockApi : realApi;
