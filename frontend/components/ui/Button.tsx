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
  primary: 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-soft hover:shadow-medium',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft hover:shadow-medium',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  ghost: 'text-primary hover:text-primary/80 hover:bg-primary/10',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-medium'
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
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
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