import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { RightRail, RomanList, FeatureDarkCard } from '../Scholar';
import type { RomanListItem } from '../Scholar';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../contexts/CreditContext';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';

interface RecentVolumesRailProps {
  /** Navigate to a target dashboard view (history / library / etc.). */
  onNavigate?: (view: 'history' | 'library' | 'main') => void;
}

interface HistoryRow {
  id: string;
  original_file_name: string | null;
  created_at: string;
}

const FALLBACK_TIPS = [
  { id: 'tip-1', title: 'Paste long passages as text', meta: 'Faster, cleaner extraction' },
  { id: 'tip-2', title: 'Upload PDFs for chapter studies', meta: 'OCR runs on scans automatically' },
  { id: 'tip-3', title: 'Switch language after generation', meta: 'Translate without re-processing' },
];

/**
 * Right rail for the Dashboard / Process Content page.
 * Composes recent volumes (Roman list) + credits block + dark feature card + tips.
 * Hidden below `lg`. Uses placeholder data when sources are not yet wired.
 */
export const RecentVolumesRail: React.FC<RecentVolumesRailProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { balance } = useCredits();
  const { t } = useI18n();
  const [recent, setRecent] = useState<HistoryRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    // TODO: connect — switch to a shared history hook once it exists.
    supabase
      .from('user_history')
      .select('id, original_file_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(3)
      .then(({ data }) => {
        if (alive) setRecent((data as HistoryRow[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const recentItems: RomanListItem[] = (recent ?? []).map((r) => ({
    id: r.id,
    title: r.original_file_name?.trim() || 'Untitled volume',
    meta: new Date(r.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    onClick: () => onNavigate?.('history'),
  }));

  const creditsRemaining = balance?.credits_remaining;

  return (
    <RightRail className="hidden lg:block" sticky>
      {/* Recent volumes */}
      <section
        aria-labelledby="rail-recent-title"
        className="border border-divider dark:border-divider-on-dark rounded-[6px] bg-card-light dark:bg-card-dark p-5"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3
            id="rail-recent-title"
            className="font-display text-base text-ink dark:text-ink-on-dark"
          >
            Recent volumes.
          </h3>
          <button
            type="button"
            onClick={() => onNavigate?.('history')}
            className="text-[11px] uppercase tracking-[0.14em] text-accent-gold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          >
            All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <RomanList
          items={recentItems}
          empty={
            <span className="text-muted-ink dark:text-muted-ink-on-dark">
              {/* TODO: connect — show ghost rows once user history is hydrated */}
              Your processed passages will appear here.
            </span>
          }
        />
      </section>

      {/* Credits block */}
      <section className="border border-divider dark:border-divider-on-dark rounded-[6px] bg-card-light dark:bg-card-dark p-5">
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-ink dark:text-muted-ink-on-dark">
          {t('header.credits_label') || 'Credits'}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-4xl font-semibold text-accent-gold tabular-nums leading-none">
            {creditsRemaining === undefined || creditsRemaining === null
              ? '—'
              : creditsRemaining.toLocaleString()}
          </span>
          <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark">remaining</span>
        </div>
        <hr className="hairline border-divider dark:border-divider-on-dark my-4" />
        <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed">
          Credits renew at the start of each cycle. Heavier passages and OCR cost more.
        </p>
      </section>

      {/* Dark feature card — hero CTA. TODO: connect to a real "today's volume" source. */}
      <FeatureDarkCard
        eyebrow="Today's volume"
        title="Open the next chapter"
        body="A short, daily reading prompt curated for steady progress. Pick up where you left off, or start something new."
        action={
          <button
            type="button"
            onClick={() => onNavigate?.('library')}
            className="text-[11px] uppercase tracking-[0.14em] font-semibold text-accent-gold inline-flex items-center gap-1 hover:opacity-90"
          >
            Bring up library <ArrowRight className="h-3 w-3" />
          </button>
        }
      />

      {/* Tips. TODO: drive from CMS / personalization later. */}
      <section className="border border-divider dark:border-divider-on-dark rounded-[6px] bg-card-light dark:bg-card-dark p-5">
        <h3 className="font-display text-base text-ink dark:text-ink-on-dark mb-3">
          Notes for the desk.
        </h3>
        <RomanList items={FALLBACK_TIPS} />
      </section>
    </RightRail>
  );
};

export default RecentVolumesRail;
