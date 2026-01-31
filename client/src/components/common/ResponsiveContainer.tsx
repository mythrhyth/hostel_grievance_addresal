import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = '2xl',
  padding = 'lg' 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6',
    lg: 'px-4 sm:px-6 lg:px-8'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md' 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };

  const gridClasses = Object.entries(cols)
    .map(([breakpoint, colCount]) => {
      if (breakpoint === 'default') {
        return `grid-cols-${colCount}`;
      }
      return `${breakpoint}:grid-cols-${colCount}`;
    })
    .join(' ');

  return (
    <div className={cn(
      'grid',
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    default?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
  };
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export function ResponsiveFlex({ 
  children, 
  className, 
  direction = { default: 'col', sm: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false
}: ResponsiveFlexProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };

  const directionClasses = Object.entries(direction)
    .map(([breakpoint, dir]) => {
      if (breakpoint === 'default') {
        return `flex-${dir}`;
      }
      return `${breakpoint}:flex-${dir}`;
    })
    .join(' ');

  return (
    <div className={cn(
      'flex',
      directionClasses,
      `items-${align}`,
      `justify-${justify}`,
      gapClasses[gap],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  responsive?: boolean;
}

export function ResponsiveText({ 
  children, 
  className, 
  size = 'base',
  weight = 'normal',
  responsive = true 
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: responsive ? 'text-xs sm:text-sm' : 'text-xs',
    sm: responsive ? 'text-sm sm:text-base' : 'text-sm',
    base: responsive ? 'text-base sm:text-lg' : 'text-base',
    lg: responsive ? 'text-lg sm:text-xl' : 'text-lg',
    xl: responsive ? 'text-xl sm:text-2xl' : 'text-xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <span className={cn(
      sizeClasses[size],
      weightClasses[weight],
      className
    )}>
      {children}
    </span>
  );
}

interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ResponsiveButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  fullWidth = { mobile: false, tablet: false, desktop: false },
  onClick,
  disabled,
  type = 'button'
}: ResponsiveButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const widthClasses = [
    fullWidth.mobile && 'w-full',
    fullWidth.tablet && 'sm:w-auto',
    fullWidth.desktop && 'lg:w-auto'
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        widthClasses,
        className
      )}
    >
      {children}
    </button>
  );
}
