import type { DateString } from './common';
import type { AcademicStatus } from './grades';

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  program: string;
  department: string;
  enrollmentYear: number;
  expectedGraduation: DateString;
  academicStanding: AcademicStatus;
  advisor: string;
  lmsUsername: string;
  totalCredits: number;
  completedCredits: number;
}
