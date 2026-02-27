import type { DashboardData } from '@/types/dashboard';
import { MOCK_ENROLLMENTS, getMockDeadlines } from './courses';
import { MOCK_EXAMS } from './grades';

export const MOCK_DASHBOARD: DashboardData = {
  stats: {
    activeCourses: 5,
    completedCourses: 4,
    currentGPA: 3.45,
    upcomingDeadlines: 5,
  },
  recentCourses: MOCK_ENROLLMENTS.slice(0, 3),
  upcomingDeadlines: getMockDeadlines().slice(0, 4),
  upcomingExams: MOCK_EXAMS,
  studentName: 'Marko Petrovic',
  program: 'Bachelor of Business Administration',
};
