'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

// Written out in full so Tailwind's scanner can see them. Building these by
// interpolation (`w-${...}`) meant they were never generated, under any version.
const sizeClasses: Record<NonNullable<ThemeToggleProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function ThemeToggle({ 
  variant = 'icon', 
  size = 'md', 
  className, 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // A plain two-way switch. Cycling light -> dark -> system meant that on a
  // machine whose OS prefers dark, "system" was visually identical to "dark":
  // the third click looked like it had done nothing, and the choice appeared to
  // revert on reload. "System" is still selectable in Settings, where it is
  // labelled and cannot be mistaken for either.
  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getIcon = () => {
    // Keyed off `resolvedTheme`, not `theme`: under "system" the stored value is
    // not what the user is looking at.
    if (resolvedTheme === 'dark') {
      return <Moon className={sizeClasses[size]} />;
    } else {
      return <Sun className={sizeClasses[size]} />;
    }
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block', className)}>
        <select
          value={theme}
          onChange={(e) => {
            const newTheme = e.target.value as 'light' | 'dark' | 'system';
            setTheme(newTheme);
          }}
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all',
          className
        )}
      >
        {getIcon()}
        {showLabel && <span className="text-sm font-medium">{getLabel()}</span>}
      </motion.button>
    );
  }

  // Default icon variant
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={cn(
        'p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all',
        className
      )}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {getIcon()}
    </motion.button>
  );
}