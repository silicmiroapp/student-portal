import api from '@/services/api';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/constants/api';
import type { Enrollment, CourseDetailResponse, CourseProgress } from '@/types/courses';
import { getMockEnrollments, getMockCourseDetail, getMockCourseProgress } from '@/mocks/courses';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockApi = {
  async getEnrollments(): Promise<Enrollment[]> {
    await delay(MOCK_DELAY);
    return getMockEnrollments();
  },

  async getCourseDetail(courseId: string): Promise<CourseDetailResponse> {
    await delay(MOCK_DELAY);
    const detail = getMockCourseDetail(courseId);
    if (!detail) throw new Error('Course not found');
    return detail;
  },

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    await delay(MOCK_DELAY);
    return getMockCourseProgress(courseId);
  },
};

const realApi = {
  async getEnrollments(): Promise<Enrollment[]> {
    const { data } = await api.get<{ enrollments: Enrollment[] }>(ENDPOINTS.COURSES.LIST);
    return data.enrollments;
  },

  async getCourseDetail(courseId: string): Promise<CourseDetailResponse> {
    const { data } = await api.get<CourseDetailResponse>(ENDPOINTS.COURSES.DETAIL(courseId));
    return data;
  },

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const { data } = await api.get<CourseProgress>(ENDPOINTS.COURSES.PROGRESS(courseId));
    return data;
  },
};

export const coursesApi = ENV.USE_MOCK_API ? mockApi : realApi;
