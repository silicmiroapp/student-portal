import type { UserRole, PermissionKey } from './rbac';

// Re-export for backward compatibility — consumers that imported
// UserRole from '@/types/auth' continue to work unchanged.
export type { UserRole } from './rbac';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Flat list of granted permissions. Source of truth for authorization. */
  permissions: PermissionKey[];
  studentId?: string;
  program?: string;
  enrollmentYear?: number;
  avatarUrl?: string;
  lmsUsername?: string;
  /** Whether the user must change their password on next login */
  mustChangePassword?: boolean;
  /** Whether the account is locked */
  isLocked?: boolean;
  /** Whether 2FA is enabled */
  twoFactorEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
