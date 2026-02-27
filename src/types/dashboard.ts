import type { Enrollment, CourseDeadline } from './courses';
import type { ExamSchedule } from './grades';

export interface DashboardStats {
  activeCourses: number;
  completedCourses: number;
  currentGPA: number;
  upcomingDeadlines: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentCourses: Enrollment[];
  upcomingDeadlines: CourseDeadline[];
  upcomingExams: ExamSchedule[];
  studentName: string;
  program: string;
}
