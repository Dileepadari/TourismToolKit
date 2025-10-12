import { useTheme } from '@/providers/ThemeProvider';
import { useEffect, useState } from 'react';

export function useThemeAware() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: 'light' as const,
      isDark: false,
      isLight: true,
      resolvedTheme: 'light' as const,
      mounted: false
    };
  }

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';

  return {
    theme,
    isDark,
    isLight,
    resolvedTheme,
    mounted
  };
}

// Theme-aware class utilities for India colors
export const themeClasses = {
  // Background gradients
  backgroundGradient: 'bg-gradient-to-br from-saffron-50 via-white to-heritage-50 dark:from-gray-900 dark:via-gray-800 dark:to-saffron-900',
  
  // Card backgrounds
  cardBackground: 'bg-white dark:bg-gray-800',
  cardBorder: 'border-gray-200 dark:border-gray-700',
  
  // Text colors
  textPrimary: 'text-gray-900 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted: 'text-gray-500 dark:text-gray-500',
  
  // Interactive elements
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
  focus: 'focus:ring-saffron-500 focus:border-saffron-500',
  
  // India-themed gradients
  saffronGradient: 'bg-gradient-to-r from-saffron-500 to-golden-500',
  heritageGradient: 'bg-gradient-to-r from-heritage-500 to-royal-500',
  royalGradient: 'bg-gradient-to-r from-royal-500 to-saffron-500',
  
  // Button variants
  primaryButton: 'bg-gradient-to-r from-saffron-500 to-heritage-500 hover:from-saffron-600 hover:to-heritage-600 text-white',
  secondaryButton: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  
  // Link colors
  link: 'text-saffron-600 hover:text-saffron-500 dark:text-saffron-400',
  
  // Input styles
  input: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
  
  // Navigation
  navBackground: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
  navBorder: 'border-gray-200 dark:border-gray-700',
  
  // Shadows
  shadow: 'shadow-soft dark:shadow-none',
  shadowMd: 'shadow-medium dark:shadow-none',
  shadowLg: 'shadow-hard dark:shadow-none',
};

// Utility function to combine theme classes
export function getThemeClasses(...classNames: (keyof typeof themeClasses)[]): string {
  return classNames.map(className => themeClasses[className]).join(' ');
}