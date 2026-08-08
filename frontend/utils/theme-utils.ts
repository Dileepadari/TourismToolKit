import { useTheme } from '@/providers/ThemeProvider';

export function useThemeAware() {
  const { theme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  return {
    theme,
    isDark,
    isLight,
    resolvedTheme,
    mounted: true,
  };
}

// Theme-aware class utilities for India colors
// Theme-aware class utilities.
//
// These map to semantic tokens rather than raw greys, so they follow the theme
// instead of hardcoding a light-mode look and patching it with `dark:`.
export const themeClasses = {
  // Page and surface backgrounds - flat, no gradients.
  backgroundGradient: 'bg-background',
  cardBackground: 'bg-card',
  cardBorder: 'border-border',

  // Text
  textPrimary: 'text-foreground',
  textSecondary: 'text-muted-foreground',
  textMuted: 'text-muted-foreground/80',

  // Interactive
  hover: 'hover:bg-muted',
  focus: 'focus:ring-ring focus:border-ring',

  // Accent surfaces
  clayAccent: 'bg-clay-500',
  verdigrisAccent: 'bg-verdigris-500',
  indigoAccent: 'bg-indigo-ink-500',

  // Buttons
  primaryButton: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  secondaryButton: 'bg-muted hover:bg-muted/80 text-foreground border border-border',

  // Links
  link: 'text-primary hover:text-primary/80',
};

// Utility function to combine theme classes
export function getThemeClasses(...classNames: (keyof typeof themeClasses)[]): string {
  return classNames.map(className => themeClasses[className]).join(' ');
}