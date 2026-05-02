import React from 'react';

interface KeyValueRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Label-left, value-right row with hairline separator below.
 * Used in profile, billing, subscription, admin detail surfaces.
 */
export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  label,
  value,
  hint,
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-3 border-b border-divider dark:border-divider-on-dark last:border-b-0 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{label}</div>
          <div className="mt-0.5 text-sm text-ink dark:text-ink-on-dark break-words">{value}</div>
          {hint ? (
            <div className="mt-1 text-xs text-muted-ink dark:text-muted-ink-on-dark">{hint}</div>
          ) : null}
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </div>
    </div>
  );
};

export default KeyValueRow;
