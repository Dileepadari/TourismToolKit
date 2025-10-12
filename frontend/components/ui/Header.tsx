'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe2, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  children?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export default function Header({
  title,
  subtitle,
  showBackButton = false,
  backHref = '/',
  children,
  className,
  gradient = true
}: HeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      gradient ? "bg-gradient-to-br from-primary via-accent to-secondary" : "bg-background",
      className
    )}>
      {/* India-inspired pattern overlay */}
      {gradient && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                href={backHref}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 group",
                  gradient 
                    ? "bg-white/20 hover:bg-white/30 text-foreground" 
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            )}
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "text-3xl md:text-4xl font-bold text-foreground"
                )}
              >
                {title}
              </motion.h1>
              
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "text-lg mt-2 text-foreground"
                  )}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {children && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* Decorative elements for India theme */}
        {gradient && (
          <>
            <div className="absolute top-4 right-4 opacity-20">
              <Globe2 className="w-16 h-16 text-foreground" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <div className="w-24 h-24 border-4 border-foreground rounded-full" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}