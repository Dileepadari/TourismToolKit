/**
 * Theme constants shared by the client provider and the server layout.
 *
 * These live outside `providers/ThemeProvider.tsx` deliberately: that module is
 * `'use client'`, and importing a plain value from a client module into a server
 * component does not reliably give you the value itself.
 */
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'tourism-theme';
/** Mirrors the choice so the server can render the right class on <html>. */
export const THEME_COOKIE = 'tt_theme';

/**
 * Runs synchronously in <head>, before first paint.
 *
 * The server already renders the class from the cookie, so this only matters on
 * a first-ever visit (no cookie yet) and for `system`, which depends on a media
 * query the server cannot evaluate.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'light';
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
    document.documentElement.dataset.theme = resolved;
    document.cookie = '${THEME_COOKIE}=' + resolved + '; path=/; max-age=31536000; SameSite=Lax';
  } catch (e) {}
})();
`.trim();
