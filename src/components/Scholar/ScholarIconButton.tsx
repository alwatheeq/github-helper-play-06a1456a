import React from 'react';
import { ScholarSpinner } from './ScholarSpinner';

export type ScholarIconButtonSize = 'sm' | 'md' | 'lg';
export type ScholarIconButtonVariant = 'ghost' | 'solid' | 'outline';

interface ScholarIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  size?: ScholarIconButtonSize;
  variant?: ScholarIconButtonVariant;
  loading?: boolean;
  /** Required for a11y when there is no visible label */
  'aria-label': string;
}

const sizeMap: Record<ScholarIconButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
};

const variantMap: Record<ScholarIconButtonVariant, string> = {
  ghost: 'bg-transparent text-ink dark:text-ink-on-dark hover:bg-subtle',
  solid: 'bg-accent-gold text-ink-on-dark hover:opacity-90',
  outline:
    'bg-transparent border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark hover:bg-subtle',
};

export const ScholarIconButton: React.FC<ScholarIconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  loading = false,
  className = '',
  disabled,
  ...rest
}) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={
      'inline-flex items-center justify-center rounded-[6px] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-[var(--s4-dur-fast)] ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page ' +
      'disabled:opacity-50 disabled:cursor-not-allowed ' +
      `${sizeMap[size]} ${variantMap[variant]} ${className}`
    }
    {...rest}
  >
    {loading ? <ScholarSpinner size={size === 'lg' ? 'md' : 'sm'} /> : icon}
  </button>
);

export default ScholarIconButton;
