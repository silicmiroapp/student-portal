import { create } from 'zustand';
import type { Enrollment, CourseDetailResponse } from '@/types/courses';
import { coursesApi } from './api';

interface CoursesState {
  enrollments: Enrollment[];
  selectedCourse: CourseDetailResponse | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  fetchEnrollments: () => Promise<void>;
  fetchCourseDetail: (courseId: string) => Promise<void>;
  clearSelectedCourse: () => void;
  clearError: () => void;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export const useCoursesStore = create<CoursesState>((set) => ({
  enrollments: [],
  selectedCourse: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchEnrollments: async () => {
    set({ isLoading: true, error: null });
    try {
      const enrollments = await coursesApi.getEnrollments();
      set({ enrollments, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load courses'), isLoading: false });
    }
  },

  fetchCourseDetail: async (courseId: string) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const detail = await coursesApi.getCourseDetail(courseId);
      set({ selectedCourse: detail, isLoadingDetail: false });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Failed to load course details'), isLoadingDetail: false });
    }
  },

  clearSelectedCourse: () => set({ selectedCourse: null }),
  clearError: () => set({ error: null }),
}));
