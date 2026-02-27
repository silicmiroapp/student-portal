export interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  program?: string;
  enrollmentYear?: number;
  avatarUrl?: string;
  lmsUsername?: string;
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
