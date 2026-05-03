import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface HistoryRow {
  id: string;
  original_file_name: string | null;
  original_input_type: string | null;
  summary_text: string | null;
  flashcards_json: Array<{ front: string; back: string }> | null;
  topics: string[] | null;
  created_at: string;
}

interface RecentlyProcessedListProps {
  onOpenHistory?: () => void;
}

/**
 * Five-column hairline list under the body grid. Numeric markers (01./02./...)
 * — no Roman numerals, no italics. Reads up to 5 latest user_history rows.
 * Subject code derives from topics[0] if available; otherwise an em-dash.
 */
export const RecentlyProcessedList: React.FC<RecentlyProcessedListProps> = ({ onOpenHistory }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    supabase
      .from('user_history')
      .select('id, original_file_name, original_input_type, summary_text, flashcards_json, topics, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(5)
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
    if (d < 7) return `${d} d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const deriveSubjectCode = (row: HistoryRow): string => {
    // TODO: connect — replace with a real subject-code field once schema supports it
    const topic = row.topics?.[0];
    if (!topic) return '—';
    return topic.slice(0, 6).toUpperCase().replace(/\s+/g, '');
  };

  const deriveOutputType = (row: HistoryRow): string => {
    const cards = row.flashcards_json?.length ?? 0;
    const summaryWords = row.summary_text
      ? row.summary_text.trim().split(/\s+/).filter(Boolean).length
      : 0;
    if (cards > 0 && summaryWords > 0) return `Summary · ${summaryWords} words`;
    if (cards > 0) return `Flashcards · ${cards} cards`;
    if (summaryWords > 0) return `Summary · ${summaryWords} words`;
    return '—';
  };

  return (
    <section aria-labelledby="recently-processed-title" style={{ marginTop: '36px' }}>
      <div className="text-[11px] font-bold tracking-[2px] uppercase text-accent-gold">
        Recently processed
      </div>
      <h2
        id="recently-processed-title"
        className="font-display text-xl font-semibold text-ink mt-1"
      >
        From the workshop.
      </h2>
      <hr className="border-divider mt-3" />

      {rows === null ? (
        <p className="text-sm text-muted-ink font-light py-3">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-ink font-light py-3">
          Your processed passages will appear here.
        </p>
      ) : (
        <ul>
          {rows.map((row, idx) => (
            <li
              key={row.id}
              onClick={onOpenHistory}
              className={`grid items-center gap-4 py-3 cursor-pointer hover:bg-subtle/40 transition-colors ${
                idx === rows.length - 1 ? '' : 'border-b border-divider'
              }`}
              style={{ gridTemplateColumns: '28px minmax(0, 1fr) 110px 200px 80px' }}
            >
              <span className="font-display text-[12px] font-medium text-accent-gold tabular-nums">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span className="font-display text-sm font-semibold text-ink truncate">
                {row.original_file_name?.trim() || 'Untitled volume'}
              </span>
              <span className="text-[11px] tracking-[1.5px] font-bold uppercase text-secondary-ink truncate">
                {deriveSubjectCode(row)}
              </span>
              <span className="font-light text-[12.5px] text-muted-ink truncate">
                {deriveOutputType(row)}
              </span>
              <span className="font-light text-[12px] text-muted-ink text-right">
                {formatRelative(row.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecentlyProcessedList;
