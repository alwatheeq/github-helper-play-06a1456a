import React from 'react';
import { X } from 'lucide-react';

export type ScholarBadgeVariant = 'default' | 'accent' | 'success' | 'warn' | 'danger';

interface ScholarBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: ScholarBadgeVariant;
  children?: React.ReactNode;
}

const variantMap: Record<ScholarBadgeVariant, string> = {
  default: 'bg-chip text-ink dark:text-ink-on-dark',
  accent: 'bg-accent-gold-soft text-ink',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const baseCls =
  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-medium tracking-wide';

export const ScholarBadge: React.FC<ScholarBadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  ...rest
}) => (
  <span className={`${baseCls} ${variantMap[variant]} ${className}`} {...rest}>
    {children}
  </span>
);

interface ScholarChipProps extends ScholarBadgeProps {
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

export const ScholarChip: React.FC<ScholarChipProps> = ({
  variant = 'default',
  className = '',
  children,
  removable = false,
  onRemove,
  removeLabel = 'Remove',
  ...rest
}) => (
  <span
    className={`${baseCls} ${variantMap[variant]} px-2.5 py-1 rounded-full ${className}`}
    {...rest}
  >
    {children}
    {removable && (
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="-mr-0.5 hover:opacity-70 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </span>
);

export default ScholarBadge;
