import type { UserRecord, SystemActivity, AdminLog, AdminStats } from '@/types/admin';

export const MOCK_USERS: UserRecord[] = [
  {
    id: '0',
    email: 'admin@portal.edu',
    name: 'System Admin',
    role: 'admin',
    isActive: true,
    lastLogin: '2026-02-27T08:30:00Z',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '1',
    email: 'demo@student.edu',
    name: 'Demo User',
    role: 'user',
    studentId: 'BUS-2025-0142',
    program: 'Bachelor of Business Administration',
    isActive: true,
    lastLogin: '2026-02-27T09:15:00Z',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'jane.smith@student.edu',
    name: 'Jane Smith',
    role: 'user',
    studentId: 'CS-2025-0087',
    program: 'Bachelor of Computer Science',
    isActive: true,
    lastLogin: '2026-02-26T14:22:00Z',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'alex.johnson@student.edu',
    name: 'Alex Johnson',
    role: 'user',
    studentId: 'ENG-2024-0201',
    program: 'Bachelor of Engineering',
    isActive: true,
    lastLogin: '2026-02-25T11:45:00Z',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '4',
    email: 'maria.garcia@student.edu',
    name: 'Maria Garcia',
    role: 'user',
    studentId: 'BUS-2025-0198',
    program: 'Bachelor of Business Administration',
    isActive: false,
    lastLogin: '2026-01-10T09:00:00Z',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: '5',
    email: 'david.lee@student.edu',
    name: 'David Lee',
    role: 'user',
    studentId: 'LAW-2024-0055',
    program: 'Bachelor of Law',
    isActive: true,
    lastLogin: '2026-02-27T07:10:00Z',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

export const MOCK_SYSTEM_ACTIVITY: SystemActivity[] = [
  {
    id: 'act-001',
    type: 'login_success',
    userId: '0',
    email: 'admin@portal.edu',
    timestamp: '2026-02-27T08:30:00Z',
  },
  {
    id: 'act-002',
    type: 'login_success',
    userId: '1',
    email: 'demo@student.edu',
    timestamp: '2026-02-27T09:15:00Z',
  },
  {
    id: 'act-003',
    type: 'login_failure',
    email: 'unknown@test.com',
    timestamp: '2026-02-27T09:20:00Z',
    details: 'Invalid credentials',
  },
  {
    id: 'act-004',
    type: 'login_success',
    userId: '5',
    email: 'david.lee@student.edu',
    timestamp: '2026-02-27T07:10:00Z',
  },
  {
    id: 'act-005',
    type: 'login_failure',
    email: 'brute@attacker.com',
    timestamp: '2026-02-26T23:45:00Z',
    details: 'Rate limited after 5 attempts',
  },
  {
    id: 'act-006',
    type: 'session_expired',
    userId: '3',
    email: 'alex.johnson@student.edu',
    timestamp: '2026-02-26T18:00:00Z',
  },
  {
    id: 'act-007',
    type: 'login_success',
    userId: '2',
    email: 'jane.smith@student.edu',
    timestamp: '2026-02-26T14:22:00Z',
  },
  {
    id: 'act-008',
    type: 'logout',
    userId: '1',
    email: 'demo@student.edu',
    timestamp: '2026-02-26T12:00:00Z',
  },
  {
    id: 'act-009',
    type: 'login_failure',
    email: 'maria.garcia@student.edu',
    timestamp: '2026-02-26T10:30:00Z',
    details: 'Account disabled',
  },
  {
    id: 'act-010',
    type: 'login_success',
    userId: '3',
    email: 'alex.johnson@student.edu',
    timestamp: '2026-02-25T11:45:00Z',
  },
];

export const MOCK_ADMIN_LOGS: AdminLog[] = [
  {
    id: 'log-001',
    adminUserId: '0',
    adminEmail: 'admin@portal.edu',
    action: 'Disabled user account',
    targetUserId: '4',
    targetEmail: 'maria.garcia@student.edu',
    timestamp: '2026-02-20T10:00:00Z',
    details: 'Account suspended for inactivity review',
  },
  {
    id: 'log-002',
    adminUserId: '0',
    adminEmail: 'admin@portal.edu',
    action: 'Viewed user details',
    targetUserId: '1',
    targetEmail: 'demo@student.edu',
    timestamp: '2026-02-22T14:30:00Z',
  },
  {
    id: 'log-003',
    adminUserId: '0',
    adminEmail: 'admin@portal.edu',
    action: 'Accessed admin dashboard',
    timestamp: '2026-02-27T08:31:00Z',
  },
  {
    id: 'log-004',
    adminUserId: '0',
    adminEmail: 'admin@portal.edu',
    action: 'Viewed student finance data',
    targetUserId: '1',
    targetEmail: 'demo@student.edu',
    timestamp: '2026-02-25T09:15:00Z',
  },
];

export function getMockAdminStats(): AdminStats {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    totalUsers: MOCK_USERS.length,
    activeUsers: MOCK_USERS.filter((u) => u.isActive).length,
    disabledUsers: MOCK_USERS.filter((u) => !u.isActive).length,
    recentLogins24h: MOCK_SYSTEM_ACTIVITY.filter(
      (a) => a.type === 'login_success' && a.timestamp >= oneDayAgo
    ).length,
    failedLogins24h: MOCK_SYSTEM_ACTIVITY.filter(
      (a) => a.type === 'login_failure' && a.timestamp >= oneDayAgo
    ).length,
    adminActions7d: MOCK_ADMIN_LOGS.filter(
      (l) => l.timestamp >= sevenDaysAgo
    ).length,
  };
}
