'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';
import { isSupportedLocale } from '@/locales';
import { THEME_STORAGE_KEY } from '@/lib/theme';

/** Matches the key LanguageProvider stores its choice under. */
const LANGUAGE_STORAGE_KEY = 'selected-language';

/**
 * Seeds the local UI from the signed-in user's saved preferences.
 *
 * Without this, `updateUserPreferences` wrote language and theme to the database
 * and nothing ever read them back - the app sourced both from localStorage, so a
 * preference set on one device never followed the user to another.
 *
 * The server value is a *default for a device that has no choice of its own*,
 * not an override. Applying it unconditionally made every reload snap the theme
 * back to the stored value and undo whatever the user had just toggled.
 */
export function PreferenceSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setSelectedLanguage } = useLanguage();
  const { setTheme } = useTheme();
  const appliedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!user || appliedFor.current === user.id) return;
    appliedFor.current = user.id;

    // A local choice always wins: whoever is using this device picked it
    // deliberately, and more recently than whatever is stored on the account.
    // Applying the account value unconditionally made every reload snap the
    // theme back and undo the toggle the user had just pressed.
    const hasLocalLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) !== null;
    const hasLocalTheme = window.localStorage.getItem(THEME_STORAGE_KEY) !== null;

    if (!hasLocalLanguage && user.preferredLanguage && isSupportedLocale(user.preferredLanguage)) {
      setSelectedLanguage(user.preferredLanguage);
    }
    if (!hasLocalTheme && (user.preferredTheme === 'light' || user.preferredTheme === 'dark')) {
      setTheme(user.preferredTheme);
    }
  }, [user, setSelectedLanguage, setTheme]);

  return <>{children}</>;
}
