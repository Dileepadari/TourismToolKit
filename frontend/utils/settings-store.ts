import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sound: boolean;
  dataSync: boolean;
  offline: boolean;
  privacy: boolean;
  autoTranslate: boolean;
  voiceEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
}

interface SettingsState {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: true,
  sound: true,
  dataSync: true,
  offline: false,
  privacy: true,
  autoTranslate: false,
  voiceEnabled: true,
  fontSize: 'md',
  highContrast: false,
  reducedMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
      
      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },
      
      importSettings: (settingsJson: string) => {
        try {
          const importedSettings = JSON.parse(settingsJson);
          
          // Validate settings structure
          const validKeys = Object.keys(defaultSettings);
          const isValid = Object.keys(importedSettings).every(key => 
            validKeys.includes(key)
          );
          
          if (isValid) {
            set({ settings: { ...defaultSettings, ...importedSettings } });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      },
    }),
    {
      name: 'tourism-app-settings',
    }
  )
);

// Helper hooks for specific settings
export const useThemeSettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return {
    theme: settings.theme,
    setTheme: (theme: AppSettings['theme']) => updateSetting('theme', theme),
  };
};

export const useLanguageSettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return {
    language: settings.language,
    autoTranslate: settings.autoTranslate,
    setLanguage: (language: string) => updateSetting('language', language),
    setAutoTranslate: (autoTranslate: boolean) => updateSetting('autoTranslate', autoTranslate),
  };
};

export const useAccessibilitySettings = () => {
  const { settings, updateSetting } = useSettingsStore();
  return {
    fontSize: settings.fontSize,
    highContrast: settings.highContrast,
    reducedMotion: settings.reducedMotion,
    setFontSize: (size: AppSettings['fontSize']) => updateSetting('fontSize', size),
    setHighContrast: (enabled: boolean) => updateSetting('highContrast', enabled),
    setReducedMotion: (enabled: boolean) => updateSetting('reducedMotion', enabled),
  };
};