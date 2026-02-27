import { create } from 'zustand';
import { z } from 'zod';
import { storage } from '@/services/storage';
import { securityLog } from '@/services/securityLog';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontScale = 'small' | 'default' | 'large' | 'extra-large';

interface SettingsState {
  themeMode: ThemeMode;
  fontScale: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  isHydrated: boolean;

  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setFontScale: (scale: FontScale) => Promise<void>;
  setHighContrast: (enabled: boolean) => Promise<void>;
  setReduceMotion: (enabled: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
}

const SETTINGS_KEY = 'user_settings';

export const FONT_SCALE_FACTORS: Record<FontScale, number> = {
  small: 0.85,
  default: 1.0,
  large: 1.2,
  'extra-large': 1.4,
};

// Schema to validate stored settings — prevents crashes from tampered data
const storedSettingsSchema = z.object({
  themeMode: z.enum(['light', 'dark', 'system']).catch('system'),
  fontScale: z.enum(['small', 'default', 'large', 'extra-large']).catch('default'),
  highContrast: z.boolean().catch(false),
  reduceMotion: z.boolean().catch(false),
});

async function persistSettings(state: SettingsState) {
  const data = {
    themeMode: state.themeMode,
    fontScale: state.fontScale,
    highContrast: state.highContrast,
    reduceMotion: state.reduceMotion,
  };
  await storage.set(SETTINGS_KEY, JSON.stringify(data));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeMode: 'system',
  fontScale: 'default',
  highContrast: false,
  reduceMotion: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await storage.get(SETTINGS_KEY);
      if (raw) {
        const parsed = storedSettingsSchema.parse(JSON.parse(raw));
        set({
          themeMode: parsed.themeMode,
          fontScale: parsed.fontScale,
          highContrast: parsed.highContrast,
          reduceMotion: parsed.reduceMotion,
          isHydrated: true,
        });
        return;
      }
    } catch {
      securityLog.storageParseError('settings');
    }
    set({ isHydrated: true });
  },

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await persistSettings(get());
  },

  setFontScale: async (scale) => {
    set({ fontScale: scale });
    await persistSettings(get());
  },

  setHighContrast: async (enabled) => {
    set({ highContrast: enabled });
    await persistSettings(get());
  },

  setReduceMotion: async (enabled) => {
    set({ reduceMotion: enabled });
    await persistSettings(get());
  },
}));
