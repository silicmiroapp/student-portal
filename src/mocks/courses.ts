import type { Enrollment, CourseDetailResponse, CourseSection, CourseDeadline, CourseProgress } from '@/types/courses';

export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-1',
    course: {
      id: 'course-1',
      name: 'Financial Accounting',
      code: 'ACC201',
      instructor: 'Dr. Sarah Mitchell',
      description: 'Fundamentals of financial accounting, including the accounting cycle, financial statements, and analysis of business transactions.',
      startDate: '2026-01-15',
      endDate: '2026-05-20',
    },
    enrolledAt: '2026-01-10',
    progress: 65,
    lastAccessed: '2026-02-26',
    grade: 'A-',
  },
  {
    id: 'enr-2',
    course: {
      id: 'course-2',
      name: 'Marketing Management',
      code: 'MKT301',
      instructor: 'Prof. James Rodriguez',
      description: 'Strategic marketing planning, consumer behavior, market segmentation, and digital marketing strategies.',
      startDate: '2026-01-15',
      endDate: '2026-05-20',
    },
    enrolledAt: '2026-01-10',
    progress: 42,
    lastAccessed: '2026-02-25',
  },
  {
    id: 'enr-3',
    course: {
      id: 'course-3',
      name: 'Business Statistics',
      code: 'STAT210',
      instructor: 'Dr. Emily Chen',
      description: 'Statistical methods for business decision-making, including probability, hypothesis testing, and regression analysis.',
      startDate: '2026-01-15',
      endDate: '2026-05-20',
    },
    enrolledAt: '2026-01-10',
    progress: 78,
    lastAccessed: '2026-02-27',
    grade: 'B+',
  },
  {
    id: 'enr-4',
    course: {
      id: 'course-4',
      name: 'Organizational Behavior',
      code: 'MGT220',
      instructor: 'Prof. David Kim',
      description: 'Study of individual and group behavior in organizations, leadership theories, motivation, and team dynamics.',
      startDate: '2026-01-15',
      endDate: '2026-05-20',
    },
    enrolledAt: '2026-01-10',
    progress: 30,
    lastAccessed: '2026-02-24',
  },
  {
    id: 'enr-5',
    course: {
      id: 'course-5',
      name: 'Business Law & Ethics',
      code: 'LAW250',
      instructor: 'Dr. Rachel Foster',
      description: 'Legal environment of business, contract law, intellectual property, and ethical decision-making frameworks.',
      startDate: '2026-01-15',
      endDate: '2026-05-20',
    },
    enrolledAt: '2026-01-10',
    progress: 55,
    lastAccessed: '2026-02-23',
  },
];

const MOCK_SECTIONS: Record<string, CourseSection[]> = {
  'course-2': [
    {
      id: 'sec-2-1',
      title: 'Module 1: Marketing Fundamentals',
      blocks: [
        { id: 'b-2-1', type: 'video', title: 'Introduction to Marketing', completed: true, duration: '18 min' },
        { id: 'b-2-2', type: 'reading', title: 'The Marketing Mix (4Ps)', completed: true, duration: '12 min' },
        { id: 'b-2-3', type: 'video', title: 'Marketing 101: What is Marketing?', completed: false, duration: '13 min', url: 'https://www.youtube.com/watch?v=pKvdb5YuC7o' },
        { id: 'b-2-4', type: 'quiz', title: 'Module 1 Quiz', completed: true, dueDate: '2026-02-05' },
      ],
    },
    {
      id: 'sec-2-2',
      title: 'Module 2: Consumer Behavior',
      blocks: [
        { id: 'b-2-5', type: 'video', title: 'Understanding Consumer Decisions', completed: true, duration: '22 min' },
        { id: 'b-2-6', type: 'reading', title: 'Market Segmentation Strategies', completed: false, duration: '15 min' },
        { id: 'b-2-7', type: 'assignment', title: 'Market Segmentation Report', completed: false, dueDate: '2026-03-03' },
      ],
    },
  ],
  'course-1': [
    {
      id: 'sec-1-1',
      title: 'Module 1: Introduction to Accounting',
      blocks: [
        { id: 'b-1-1', type: 'video', title: 'What is Accounting?', completed: true, duration: '20 min' },
        { id: 'b-1-2', type: 'reading', title: 'The Accounting Equation', completed: true, duration: '15 min' },
        { id: 'b-1-3', type: 'quiz', title: 'Module 1 Quiz', completed: true, dueDate: '2026-02-01' },
      ],
    },
    {
      id: 'sec-1-2',
      title: 'Module 2: The Accounting Cycle',
      blocks: [
        { id: 'b-1-4', type: 'video', title: 'Journal Entries & Ledgers', completed: true, duration: '25 min' },
        { id: 'b-1-5', type: 'reading', title: 'Trial Balance', completed: true, duration: '10 min' },
        { id: 'b-1-6', type: 'assignment', title: 'Practice Problem Set 1', completed: true, dueDate: '2026-02-15' },
      ],
    },
    {
      id: 'sec-1-3',
      title: 'Module 3: Financial Statements',
      blocks: [
        { id: 'b-1-7', type: 'video', title: 'Income Statement', completed: true, duration: '18 min' },
        { id: 'b-1-8', type: 'video', title: 'Balance Sheet', completed: false, duration: '22 min' },
        { id: 'b-1-9', type: 'assignment', title: 'Financial Statement Analysis', completed: false, dueDate: '2026-03-05' },
        { id: 'b-1-10', type: 'quiz', title: 'Midterm Exam', completed: false, dueDate: '2026-03-10' },
      ],
    },
  ],
};

const MOCK_DEADLINES: CourseDeadline[] = [
  {
    id: 'dl-1',
    courseId: 'course-1',
    courseName: 'Financial Accounting',
    title: 'Financial Statement Analysis',
    dueDate: '2026-03-05',
    type: 'assignment',
  },
  {
    id: 'dl-2',
    courseId: 'course-1',
    courseName: 'Financial Accounting',
    title: 'Midterm Exam',
    dueDate: '2026-03-10',
    type: 'exam',
  },
  {
    id: 'dl-3',
    courseId: 'course-2',
    courseName: 'Marketing Management',
    title: 'Market Segmentation Report',
    dueDate: '2026-03-03',
    type: 'assignment',
  },
  {
    id: 'dl-4',
    courseId: 'course-3',
    courseName: 'Business Statistics',
    title: 'Hypothesis Testing Quiz',
    dueDate: '2026-03-01',
    type: 'quiz',
  },
  {
    id: 'dl-5',
    courseId: 'course-4',
    courseName: 'Organizational Behavior',
    title: 'Leadership Case Study',
    dueDate: '2026-03-08',
    type: 'assignment',
  },
];

const MOCK_PROGRESS: Record<string, CourseProgress> = {
  'course-1': { courseId: 'course-1', completedBlocks: 7, totalBlocks: 10, percentage: 65, lastAccessed: '2026-02-26' },
  'course-2': { courseId: 'course-2', completedBlocks: 5, totalBlocks: 12, percentage: 42, lastAccessed: '2026-02-25' },
  'course-3': { courseId: 'course-3', completedBlocks: 7, totalBlocks: 9, percentage: 78, lastAccessed: '2026-02-27' },
  'course-4': { courseId: 'course-4', completedBlocks: 3, totalBlocks: 10, percentage: 30, lastAccessed: '2026-02-24' },
  'course-5': { courseId: 'course-5', completedBlocks: 5, totalBlocks: 9, percentage: 55, lastAccessed: '2026-02-23' },
};

export function getMockEnrollments(): Enrollment[] {
  return MOCK_ENROLLMENTS;
}

export function getMockCourseDetail(courseId: string): CourseDetailResponse | null {
  const enrollment = MOCK_ENROLLMENTS.find((e) => e.course.id === courseId);
  if (!enrollment) return null;

  return {
    course: enrollment.course,
    enrollment,
    sections: MOCK_SECTIONS[courseId] ?? [
      {
        id: `sec-${courseId}-1`,
        title: 'Module 1: Introduction',
        blocks: [
          { id: `b-${courseId}-1`, type: 'video', title: 'Course Overview', completed: true, duration: '15 min' },
          { id: `b-${courseId}-2`, type: 'reading', title: 'Course Syllabus', completed: true, duration: '10 min' },
          { id: `b-${courseId}-3`, type: 'quiz', title: 'Pre-Assessment', completed: false, dueDate: '2026-03-01' },
        ],
      },
    ],
    progress: MOCK_PROGRESS[courseId] ?? { courseId, completedBlocks: 0, totalBlocks: 0, percentage: 0 },
    deadlines: MOCK_DEADLINES.filter((d) => d.courseId === courseId),
  };
}

export function getMockCourseProgress(courseId: string): CourseProgress {
  return MOCK_PROGRESS[courseId] ?? { courseId, completedBlocks: 0, totalBlocks: 0, percentage: 0 };
}

export function getMockDeadlines(): CourseDeadline[] {
  return MOCK_DEADLINES;
}
