import Constants from 'expo-constants';

// Environment configuration resolved at build time via app.json extra or .env
// In production, set these via EAS Build secrets or your CI/CD pipeline.

function getEnvVar(key: string, fallback?: string): string {
  const value =
    (Constants.expoConfig?.extra?.[key] as string | undefined) ??
    process.env[key] ??
    fallback;

  if (value === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Set it in app.json "extra" or as a build-time env var.`
    );
  }
  return value;
}

function getBoolEnvVar(key: string, fallback: boolean): boolean {
  const raw =
    (Constants.expoConfig?.extra?.[key] as string | undefined) ??
    process.env[key];
  if (raw === undefined) return fallback;
  return raw === 'true' || raw === '1';
}

// ── Resolved config ────────────────────────────────────────────────────
export const ENV = {
  /** Base URL for API calls — MUST be HTTPS in production */
  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://api.example.com/v1'),

  /** Request timeout in milliseconds */
  API_TIMEOUT: Number(getEnvVar('API_TIMEOUT', '10000')),

  /** When true, mock APIs are used instead of real endpoints */
  USE_MOCK_API: getBoolEnvVar('USE_MOCK_API', __DEV__),

  /** When true, enables verbose security logging to console */
  ENABLE_SECURITY_LOG: getBoolEnvVar('ENABLE_SECURITY_LOG', __DEV__),
} as const;

// ── Runtime safety checks ──────────────────────────────────────────────
if (!__DEV__) {
  if (ENV.USE_MOCK_API) {
    throw new Error(
      'SECURITY: Mock API is enabled in a production build. ' +
      'Set USE_MOCK_API=false or remove it from your environment.'
    );
  }

  if (!ENV.API_BASE_URL.startsWith('https://')) {
    throw new Error(
      'SECURITY: API_BASE_URL must use HTTPS in production builds. ' +
      `Current value: "${ENV.API_BASE_URL}"`
    );
  }

  if (ENV.API_BASE_URL.includes('example.com')) {
    throw new Error(
      'SECURITY: API_BASE_URL still points to example.com. ' +
      'Set a real API URL before deploying.'
    );
  }
}
