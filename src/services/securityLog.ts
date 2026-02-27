import { ENV } from '@/config/env';

type SecurityEvent =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_REGISTER_SUCCESS'
  | 'AUTH_REGISTER_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_TOKEN_REFRESH_FAILURE'
  | 'AUTH_HYDRATE_CORRUPT'
  | 'AUTH_RATE_LIMITED'
  | 'STORAGE_PARSE_ERROR';

// Security-safe metadata — NEVER include passwords, tokens, or PII
interface LogMeta {
  /** Masked email: j***@example.com */
  email?: string;
  reason?: string;
  attempts?: number;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const masked = local.length > 1 ? local[0] + '***' : '***';
  return `${masked}@${domain}`;
}

function logSecurityEvent(event: SecurityEvent, meta?: LogMeta): void {
  if (!ENV.ENABLE_SECURITY_LOG) return;

  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...(meta ?? {}),
  };

  // In production, replace console.info with your logging service
  // (e.g., Sentry, Datadog, CloudWatch)
  console.info('[SECURITY]', JSON.stringify(entry));
}

export const securityLog = {
  loginSuccess: (email: string) =>
    logSecurityEvent('AUTH_LOGIN_SUCCESS', { email: maskEmail(email) }),

  loginFailure: (email: string, reason: string) =>
    logSecurityEvent('AUTH_LOGIN_FAILURE', { email: maskEmail(email), reason }),

  registerSuccess: (email: string) =>
    logSecurityEvent('AUTH_REGISTER_SUCCESS', { email: maskEmail(email) }),

  registerFailure: (email: string, reason: string) =>
    logSecurityEvent('AUTH_REGISTER_FAILURE', { email: maskEmail(email), reason }),

  logout: () =>
    logSecurityEvent('AUTH_LOGOUT'),

  sessionExpired: () =>
    logSecurityEvent('AUTH_SESSION_EXPIRED'),

  tokenRefresh: () =>
    logSecurityEvent('AUTH_TOKEN_REFRESH'),

  tokenRefreshFailure: (reason: string) =>
    logSecurityEvent('AUTH_TOKEN_REFRESH_FAILURE', { reason }),

  hydrateCorrupt: () =>
    logSecurityEvent('AUTH_HYDRATE_CORRUPT'),

  rateLimited: (email: string, attempts: number) =>
    logSecurityEvent('AUTH_RATE_LIMITED', { email: maskEmail(email), attempts }),

  storageParseError: (reason: string) =>
    logSecurityEvent('STORAGE_PARSE_ERROR', { reason }),
};
