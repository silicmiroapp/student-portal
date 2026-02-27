import type { StudentProfile } from '@/types/profile';

export const MOCK_PROFILE: StudentProfile = {
  id: '1',
  studentId: 'BUS-2025-0142',
  name: 'Marko Petrovic',
  email: 'demo@student.edu',
  phone: '+1 (555) 123-4567',
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
