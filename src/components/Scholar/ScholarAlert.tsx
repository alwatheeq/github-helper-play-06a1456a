import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export type ScholarAlertVariant = 'info' | 'success' | 'warn' | 'danger';

interface ScholarAlertProps {
  variant?: ScholarAlertVariant;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const variantBar: Record<ScholarAlertVariant, string> = {
  info: 'bg-accent-gold',
  success: 'bg-green-500',
  warn: 'bg-yellow-500',
  danger: 'bg-red-500',
};

const variantIcon: Record<ScholarAlertVariant, React.ReactNode> = {
  info: <Info className="h-5 w-5 text-accent-gold" />,
  success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  warn: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  danger: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
};

export const ScholarAlert: React.FC<ScholarAlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
  icon,
}) => {
  return (
    <div
      role="alert"
      className={
        'relative flex items-start gap-3 pl-4 pr-3 py-3 rounded-[6px] ' +
        'bg-card-light dark:bg-card-dark ' +
        'border border-divider dark:border-divider-on-dark ' +
        'shadow-[var(--scholar-shadow-sm)] ' +
        'overflow-hidden ' +
        className
      }
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${variantBar[variant]}`} aria-hidden="true" />
      <span className="flex-shrink-0 mt-0.5">{icon ?? variantIcon[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-ink dark:text-ink-on-dark mb-0.5">{title}</p>
        )}
        {children && (
          <div className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">{children}</div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded text-muted-ink dark:text-muted-ink-on-dark hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ScholarAlert;
