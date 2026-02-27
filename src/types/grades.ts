import type { DateString } from './common';

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  instructor: string;
}

export interface Grade {
  id: string;
  subject: Subject;
  letterGrade: string; // A, B+, C, etc.
  numericalGrade: number; // 0–100
  gradePoints: number; // 4.0 scale
  status: 'passed' | 'failed' | 'in_progress' | 'withdrawn';
  completedAt?: DateString;
}

export interface GradeSummary {
  cumulativeGPA: number;
  semesterGPA: number;
  totalCredits: number;
  completedCredits: number;
  totalSubjects: number;
  passedSubjects: number;
  academicStanding: AcademicStatus;
}

export type AcademicStatus = 'good_standing' | 'deans_list' | 'probation' | 'warning';

export interface ExamSchedule {
  id: string;
  subjectName: string;
  subjectCode: string;
  date: DateString;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "11:00"
  location: string;
  type: 'midterm' | 'final' | 'quiz';
}
