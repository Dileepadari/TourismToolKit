import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, gradient = false, onClick }: CardProps) {
  if (onClick || hover) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={hover ? { y: -2, scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        className={cn(
          'rounded-xl shadow-soft border border-border',
          gradient ? 'bg-gradient-to-br from-card to-primary/5 dark:from-card dark:to-background' : 'bg-card',
          hover && 'transition-all duration-200 hover:shadow-medium',
          onClick && 'cursor-pointer',
          className
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl shadow-soft border border-border',
        gradient ? 'bg-gradient-to-br from-card to-primary/5 dark:from-card dark:to-background' : 'bg-card',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-b border-border', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-t border-border', className)}>
      {children}
    </div>
  );
}