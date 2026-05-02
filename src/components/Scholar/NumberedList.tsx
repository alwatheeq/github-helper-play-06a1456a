import React from 'react';

export interface NumberedListItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

interface NumberedListProps {
  items: NumberedListItem[];
  /** Starting number (default 1). */
  start?: number;
  className?: string;
  empty?: React.ReactNode;
}

/**
 * Plain arabic-numeral list (1. 2. 3.) with hairline dividers and a right-slot action.
 * Explicitly NOT roman numerals. No italics.
 */
export const NumberedList: React.FC<NumberedListProps> = ({
  items,
  start = 1,
  className = '',
  empty,
}) => {
  if (items.length === 0 && empty) {
    return (
      <div className={`py-8 text-center text-sm text-muted-ink dark:text-muted-ink-on-dark ${className}`}>
        {empty}
      </div>
    );
  }

  return (
    <ol className={`w-full divide-y divide-divider dark:divide-divider-on-dark ${className}`}>
      {items.map((item, idx) => (
        <li
          key={item.id}
          className={`py-4 flex items-center gap-4 ${item.onClick ? 'cursor-pointer hover:bg-subtle px-2 -mx-2 rounded-[6px] transition-colors' : ''}`}
          onClick={item.onClick}
        >
          <span className="font-display text-lg text-muted-ink dark:text-muted-ink-on-dark w-8 flex-shrink-0 tabular-nums">
            {start + idx}.
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-ink dark:text-ink-on-dark truncate">
              {item.title}
            </div>
            {item.meta ? (
              <div className="mt-0.5 text-xs text-muted-ink dark:text-muted-ink-on-dark truncate">
                {item.meta}
              </div>
            ) : null}
          </div>
          {item.action ? <div className="flex-shrink-0">{item.action}</div> : null}
        </li>
      ))}
    </ol>
  );
};

export default NumberedList;
