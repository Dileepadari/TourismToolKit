'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface LayoutNavigationProps {
  children: React.ReactNode;
}

export default function LayoutNavigation({ children }: LayoutNavigationProps) {
  const pathname = usePathname();
  
  // Don't show navigation on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Don't show navigation on landing page
  const isLandingPage = pathname === '/';
  
  const shouldShowNavigation = !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {shouldShowNavigation && <Navigation />}
      <main className={shouldShowNavigation ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
}