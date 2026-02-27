import type { UserRole } from './auth';
import type { DateString } from './common';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  program?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type ActivityType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired';

export interface SystemActivity {
  id: string;
  type: ActivityType;
  userId?: string;
  email: string;
  timestamp: string;
  details?: string;
}

export interface AdminLog {
  id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  timestamp: string;
  details?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  recentLogins24h: number;
  failedLogins24h: number;
  adminActions7d: number;
}
