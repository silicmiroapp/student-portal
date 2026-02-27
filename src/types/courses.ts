import type { DateString } from './common';

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  imageUrl?: string;
  description: string;
  startDate: DateString;
  endDate: DateString;
}

export interface Enrollment {
  id: string;
  course: Course;
  enrolledAt: DateString;
  progress: number; // 0–100
  lastAccessed?: DateString;
  grade?: string;
}

export interface CourseBlock {
  id: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
  title: string;
  completed: boolean;
  dueDate?: DateString;
  duration?: string; // e.g. "15 min"
  url?: string;
}

export interface CourseSection {
  id: string;
  title: string;
  blocks: CourseBlock[];
}

export interface CourseDeadline {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  dueDate: DateString;
  type: 'assignment' | 'quiz' | 'exam';
}

export interface CourseProgress {
  courseId: string;
  completedBlocks: number;
  totalBlocks: number;
  percentage: number;
  lastAccessed?: DateString;
}

export interface CourseDetailResponse {
  course: Course;
  enrollment: Enrollment;
  sections: CourseSection[];
  progress: CourseProgress;
  deadlines: CourseDeadline[];
}
