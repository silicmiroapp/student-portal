import { Platform } from 'react-native';

// ── Color palette type ─────────────────────────────────────────────────
export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  borderLight: string;
  error: string;
  errorLight: string;
  errorBorder: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  inputBackground: string;
}

// ── Light palette ──────────────────────────────────────────────────────
export const lightColors: ColorPalette = {
  primary: '#b9312c',
  primaryDark: '#9a2824',
  primaryLight: '#fdf0f0',
  secondary: '#00a1c1',
  secondaryDark: '#008aa6',
  secondaryLight: '#e6f7fb',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#64748B',
  textLight: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F0F2F5',
  error: '#b9312c',
  errorLight: '#fdf0f0',
  errorBorder: '#f0c5c3',
  success: '#2cb936',
  successLight: '#f0fdf4',
  warning: '#fd9308',
  warningLight: '#fff7eb',
  info: '#00a1c1',
  infoLight: '#e6f7fb',
  inputBackground: '#F1F5F9',
};

// ── Dark palette ───────────────────────────────────────────────────────
export const darkColors: ColorPalette = {
  primary: '#e0534e',
  primaryDark: '#b9312c',
  primaryLight: '#3d1a19',
  secondary: '#33b4cd',
  secondaryDark: '#00a1c1',
  secondaryLight: '#0d2e35',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#2A2A2A',
  text: '#E8E8E8',
  textSecondary: '#9CA3AF',
  textLight: '#FFFFFF',
  border: '#3A3A3A',
  borderLight: '#2E2E2E',
  error: '#ef6b67',
  errorLight: '#3d1a19',
  errorBorder: '#7a3230',
  success: '#4ade80',
  successLight: '#14321e',
  warning: '#fbbf24',
  warningLight: '#3d2e0a',
  info: '#33b4cd',
  infoLight: '#0d2e35',
  inputBackground: '#2A2A2A',
};

// ── High-contrast overrides ────────────────────────────────────────────
export const highContrastLightOverrides: Partial<ColorPalette> = {
  text: '#000000',
  textSecondary: '#333333',
  border: '#999999',
  borderLight: '#BBBBBB',
};

export const highContrastDarkOverrides: Partial<ColorPalette> = {
  text: '#FFFFFF',
  textSecondary: '#D4D4D4',
  border: '#666666',
  borderLight: '#555555',
  background: '#000000',
  surface: '#0A0A0A',
  surfaceAlt: '#1A1A1A',
};

// ── Static tokens (unchanged by theme) ─────────────────────────────────
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
  lg: 20,
  xl: 26,
  xxl: 34,
} as const;

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 25,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
  })!,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
  })!,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
  })!,
} as const;

export const FONTS = {
  regular: 'OpenSans_400Regular',
  semiBold: 'OpenSans_600SemiBold',
  bold: 'OpenSans_700Bold',
} as const;
