/**
 * Theme configuration utilities
 * Centralized theme colors and utilities for consistent theming across the app
 */

export const themeColors = {
  light: {
    background: '#ffffff',
    foreground: '#171717',
    card: '#ffffff',
    cardForeground: '#171717',
    primary: '#f97316',
    primaryForeground: '#ffffff',
    secondary: '#22c55e',
    secondaryForeground: '#ffffff',
    accent: '#3b82f6',
    accentForeground: '#ffffff',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    border: '#e5e5e5',
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#ededed',
    card: '#171717',
    cardForeground: '#ededed',
    primary: '#fb923c',
    primaryForeground: '#171717',
    secondary: '#4ade80',
    secondaryForeground: '#171717',
    accent: '#60a5fa',
    accentForeground: '#171717',
    muted: '#262626',
    mutedForeground: '#a3a3a3',
    border: '#262626',
    destructive: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',
  },
} as const;

export const indiaColors = {
  saffron: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  heritage: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  royal: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  golden: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
} as const;

/**
 * Get theme color based on current theme mode
 */
export function getThemeColor(
  colorKey: keyof typeof themeColors.light,
  isDark: boolean
): string {
  return isDark ? themeColors.dark[colorKey] : themeColors.light[colorKey];
}

/**
 * Apply theme to document root
 */
export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  let resolvedTheme: 'light' | 'dark' = 'light';
  
  if (theme === 'system') {
    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } else {
    resolvedTheme = theme;
  }

  root.classList.add(resolvedTheme);

  // Update meta theme color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      resolvedTheme === 'dark' ? themeColors.dark.background : themeColors.light.background
    );
  }
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Storage key for theme persistence
 */
export const THEME_STORAGE_KEY = 'tourism-theme';

/**
 * Valid theme values
 */
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
