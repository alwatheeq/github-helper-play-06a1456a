import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface HistoryRow {
  id: string;
  original_file_name: string | null;
  created_at: string;
}

interface RecentlyProcessedListProps {
  onOpenHistory?: () => void;
}

/**
 * In-column "Recently processed" list. Numeric markers (01/02/03) — no Roman numerals.
 * Hairline dividers between rows. Reads up to 3 latest entries from user_history.
 */
export const RecentlyProcessedList: React.FC<RecentlyProcessedListProps> = ({ onOpenHistory }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    // TODO: connect to richer history hook when one exists
    supabase
      .from('user_history')
      .select('id, original_file_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data }) => {
        if (alive) setRows((data as HistoryRow[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.round(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.round(h / 24);
    return `${d} d ago`;
  };

  return (
    <section aria-labelledby="recently-processed-title" className="mt-10">
      <h2
        id="recently-processed-title"
        className="text-[11px] font-semibold tracking-[0.16em] uppercase text-accent-gold mb-4"
      >
        Recently processed
      </h2>

      {rows === null ? (
        <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark font-light">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark font-light">
          Your processed passages will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-divider dark:divide-divider-on-dark border-y border-divider dark:border-divider-on-dark">
          {rows.map((row, idx) => (
            <li key={row.id} className="flex items-center gap-4 py-4">
              <span className="text-xs font-semibold tracking-[0.12em] text-accent-gold tabular-nums w-7">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-ink dark:text-ink-on-dark truncate">
                  {row.original_file_name?.trim() || 'Untitled volume'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                  {formatRelative(row.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-sm text-ink dark:text-ink-on-dark border border-divider dark:border-divider-on-dark rounded-[6px] px-4 py-1.5 hover:border-accent-gold transition-colors"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentlyProcessedList;
