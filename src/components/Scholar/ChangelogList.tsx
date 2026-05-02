import React from 'react';

export interface ChangelogEntry {
  id: string;
  version: React.ReactNode;
  title: React.ReactNode;
  date?: React.ReactNode;
}

interface ChangelogListProps {
  entries: ChangelogEntry[];
  className?: string;
}

/**
 * Vertical list of version + title rows separated by hairlines.
 * Used in the Feedback right rail.
 */
export const ChangelogList: React.FC<ChangelogListProps> = ({ entries, className = '' }) => {
  return (
    <ul className={`w-full divide-y divide-divider dark:divide-divider-on-dark ${className}`}>
      {entries.map((e) => (
        <li key={e.id} className="py-3 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent-gold">
              {e.version}
            </div>
            <div className="mt-0.5 text-sm text-ink dark:text-ink-on-dark truncate">{e.title}</div>
          </div>
          {e.date ? (
            <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0">
              {e.date}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default ChangelogList;
