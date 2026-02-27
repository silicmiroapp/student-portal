import type { StudentProfile } from '@/types/profile';

export const MOCK_PROFILE: StudentProfile = {
  id: '1',
  studentId: 'BUS-2025-0142',
  name: 'Demo User',
  email: 'user@student.example',
  phone: '+1 (555) 000-0000',
  program: 'Bachelor of Business Administration',
  department: 'School of Business',
  enrollmentYear: 2025,
  expectedGraduation: '2029-05-15',
  academicStanding: 'good_standing',
  advisor: 'Prof. Margaret Thompson',
  lmsUsername: 'mpetrovic',
  totalCredits: 120,
  completedCredits: 11,
};
