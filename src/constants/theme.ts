// Centralized design tokens for consistent styling across the app
export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#64748B',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#FFFFFF',
  border: '#E2E8F0',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  inputBackground: '#F1F5F9',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;
