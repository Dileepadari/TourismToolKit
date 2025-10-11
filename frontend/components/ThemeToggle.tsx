'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  variant = 'icon', 
  size = 'md', 
  className,
  showLabel = false 
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted (client-side only)
  if (!mounted) {
    return (
      <div className={cn(
        'p-2 rounded-lg bg-muted',
        className
      )}>
        <Sun className={`w-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'} h-${size === 'sm' ? '4' : size === 'lg' ? '6' : '5'}`} />
      </div>
    );
  }

  return <ThemeToggleContent variant={variant} size={size} className={className} showLabel={showLabel} />;
}

function ThemeToggleContent({ 
  variant = 'icon', 
  size = 'md', 
  className, 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const cycleTheme = () => {
    let newTheme: 'light' | 'dark' | 'system';
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }
    setTheme(newTheme);
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className={sizeClasses[size]} />;
    } else if (theme === 'light') {
      return <Sun className={sizeClasses[size]} />;
    } else {
      return <Monitor className={sizeClasses[size]} />;
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
          className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
        >
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
        onClick={cycleTheme}
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
      onClick={cycleTheme}
      className={cn(
        'p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-all',
        className
      )}
      title={`Switch to ${theme === 'dark' ? 'system' : theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {getIcon()}
    </motion.button>
  );
}