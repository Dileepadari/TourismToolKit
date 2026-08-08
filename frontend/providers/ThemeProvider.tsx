'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { THEME_COOKIE, THEME_STORAGE_KEY } from '@/lib/theme';
import type { ResolvedTheme, Theme } from '@/lib/theme';

export type { ResolvedTheme, Theme } from '@/lib/theme';
export { THEME_COOKIE, THEME_STORAGE_KEY, themeInitScript } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  // Both classes are managed explicitly. Only toggling `dark` left the server's
  // `light` class in place, so the element ended up as `class="light dark"`.
  root.classList.toggle('dark', resolved === 'dark');
  root.classList.toggle('light', resolved === 'light');
  root.dataset.theme = resolved;
  // Written for the server's benefit, not the client's: the root layout reads it
  // so the very first HTML already carries the right class.
  document.cookie = `${THEME_COOKIE}=${resolved}; path=/; max-age=31536000; SameSite=Lax`;
}

/** Read the theme the init script already committed to, so state starts correct. */
function readInitialTheme(storageKey: string): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(storageKey);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // Lazy initialisers, so the first client render already matches what the
  // blocking script put on <html>. The previous version started from the default
  // and corrected itself in an effect, which is what caused the flash *and* the
  // cascading-render lint errors.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return readInitialTheme(storageKey);
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof window === 'undefined' ? 'light' : resolveTheme(readInitialTheme(storageKey)),
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, newTheme);
      }
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  // Re-apply on mount. The blocking script in <head> puts the class on <html>
  // before first paint, but hydration reconciles that element against a server
  // render that had no class, which strips it again.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Follow the OS preference while the user has chosen "system".
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // The provider is always rendered - there is no pre-mount branch returning a
  // different tree. Previously any child calling useTheme() during that window
  // threw, which is why several components carried their own `mounted` guards.
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
