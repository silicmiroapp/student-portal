import { useColorScheme } from 'react-native';
import { useSettingsStore, FONT_SCALE_FACTORS } from '@/features/settings/store';
import {
  lightColors,
  darkColors,
  highContrastLightOverrides,
  highContrastDarkOverrides,
  FONT_SIZE,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  FONTS,
  type ColorPalette,
} from '@/constants/theme';

export interface Theme {
  colors: ColorPalette;
  fonts: typeof FONTS;
  spacing: typeof SPACING;
  fontSize: Record<keyof typeof FONT_SIZE, number>;
  borderRadius: typeof BORDER_RADIUS;
  shadows: typeof SHADOWS;
  isDark: boolean;
  fontScaleFactor: number;
  reduceMotion: boolean;
}

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const { themeMode, fontScale, highContrast, reduceMotion } = useSettingsStore();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  let colors: ColorPalette = isDark ? { ...darkColors } : { ...lightColors };

  if (highContrast) {
    const overrides = isDark ? highContrastDarkOverrides : highContrastLightOverrides;
    colors = { ...colors, ...overrides } as ColorPalette;
  }

  const factor = FONT_SCALE_FACTORS[fontScale];
  const scaledFontSize = Object.fromEntries(
    Object.entries(FONT_SIZE).map(([key, val]) => [key, Math.round(val * factor)]),
  ) as Record<keyof typeof FONT_SIZE, number>;

  return {
    colors,
    fonts: FONTS,
    spacing: SPACING,
    fontSize: scaledFontSize,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    isDark,
    fontScaleFactor: factor,
    reduceMotion,
  };
}
