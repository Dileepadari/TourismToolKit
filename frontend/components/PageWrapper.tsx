'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { themeClasses } from '@/utils/theme-utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  fullHeight?: boolean;
}

export default function PageWrapper({ 
  children, 
  className, 
  gradient = true,
  fullHeight = true 
}: PageWrapperProps) {
  return (
    <div className={cn(
      fullHeight && 'min-h-screen',
      gradient ? themeClasses.backgroundGradient : themeClasses.cardBackground,
      'transition-colors duration-300',
      className
    )}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn(
      'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b',
      themeClasses.navBorder,
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn('text-3xl font-bold', themeClasses.textPrimary)}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn('mt-2', themeClasses.textSecondary)}>
                {subtitle}
              </p>
            )}
          </div>
          {children && (
            <div className="flex items-center space-x-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: boolean;
}

export function PageContent({ 
  children, 
  className, 
  maxWidth = '7xl',
  padding = true 
}: PageContentProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      maxWidthClasses[maxWidth],
      'mx-auto',
      padding && 'px-4 sm:px-6 lg:px-8 py-8',
      className
    )}>
      {children}
    </div>
  );
}