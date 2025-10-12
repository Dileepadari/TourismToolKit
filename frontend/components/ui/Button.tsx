import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-saffron-500 to-golden-500 text-white hover:from-saffron-600 hover:to-golden-600 shadow-soft hover:shadow-medium',
  secondary: 'bg-heritage-600 text-white hover:bg-heritage-700 shadow-soft hover:shadow-medium',
  outline: 'border-2 border-saffron-300 dark:border-saffron-600 text-saffron-700 dark:text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/20',
  ghost: 'text-heritage-600 dark:text-heritage-400 hover:text-heritage-900 dark:hover:text-heritage-200 hover:bg-heritage-50 dark:hover:bg-heritage-900/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft hover:shadow-medium'
};

const sizeVariants = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          sizeVariants[size],
          className
        )}
        disabled={isDisabled}
        {...props}
    >
      {loading && (
        <Loader className="w-4 h-4 animate-spin mr-2" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
      </button>
    </motion.div>
  );
}