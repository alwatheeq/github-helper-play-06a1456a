import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { ScholarCard, ScholarButton, PageHeader, ScholarSkeleton } from '../Scholar';

interface HistoryEntry {
  id: string;
  original_input_type: string;
  original_file_name: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  topics?: string[];
  created_at: string;
  expires_at: string;
}

interface HistoryPageProps {
  onViewHistoryEntry?: (entry: HistoryEntry) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = React.memo(({ onViewHistoryEntry }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('history');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('created_at_desc');
  const [filterTab, setFilterTab] = useState<string>('All');

  useEffect(() => {
    fetchHistory(sortOption);
  }, [user, sortOption]);

  // Show tutorial on first visit
  useEffect(() => {
    if (shouldShowTutorial && !loading) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, loading, showTutorial]);

  const fetchHistory = async (currentSortOption: string = sortOption) => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError((msg) => setError(msg));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      ErrorLogger.debug('Fetching history with sort option', { component: 'HistoryPage', action: 'fetchHistory', sortOption: currentSortOption });

      let query = supabase
        .from('user_history')
        .select('*')
        .eq('user_id', user.id);

      // Apply sorting based on the selected option
      if (currentSortOption === 'created_at_desc') {
        query = query.order('created_at', { ascending: false });
      } else if (currentSortOption === 'created_at_asc') {
        query = query.order('created_at', { ascending: true });
      } else if (currentSortOption === 'filename_asc') {
        query = query.order('original_file_name', { ascending: true, nullsFirst: false });
      } else if (currentSortOption === 'filename_desc') {
        query = query.order('original_file_name', { ascending: false, nullsFirst: false });
      } else {
        // Default fallback
        query = query.order('created_at', { ascending: false });
      }

      ErrorLogger.debug('Applied sort option', { component: 'HistoryPage', action: 'fetchHistory', sortOption: currentSortOption });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        const errorMessage = handleSupabaseError(fetchError, { component: 'HistoryPage', action: 'fetchHistory' });
        ErrorLogger.error(fetchError instanceof Error ? fetchError : new Error(String(fetchError)), { component: 'HistoryPage', action: 'fetchHistory' });
        throw new Error(errorMessage);
      }

      ErrorLogger.debug('Fetched history entries', { component: 'HistoryPage', action: 'fetchHistory', entryCount: data?.length || 0 });
      setHistoryEntries(data || []);
    } catch (err) {
      const errorMessage = handleApiError(err, { component: 'HistoryPage', action: 'fetchHistory' });
      ErrorLogger.error(err instanceof Error ? err : new Error(String(err)), { component: 'HistoryPage', action: 'fetchHistory' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const TYPE_COLOR = '#5B7A3A';

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const itemsThisWeek = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return historyEntries.filter(e => new Date(e.created_at).getTime() >= oneWeekAgo).length;
  }, [historyEntries]);

  const filteredEntries = useMemo(() => {
    if (filterTab === 'All' || filterTab === 'Library') return historyEntries;
    return [];
  }, [historyEntries, filterTab]);

  const groupedEntries = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateMap = new Map<string, HistoryEntry[]>();
    for (const entry of filteredEntries) {
      const d = new Date(entry.created_at);
      const key = d.toDateString() === today.toDateString()
        ? 'Today'
        : d.toDateString() === yesterday.toDateString()
          ? 'Yesterday'
          : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(entry);
    }
    return Array.from(dateMap, ([date, items]) => ({ date, items }));
  }, [filteredEntries]);

  const weekBarData = useMemo(() => {
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const todayDow = now.getDay();
    const todayIdx = todayDow === 0 ? 6 : todayDow - 1;
    for (const entry of historyEntries) {
      const d = new Date(entry.created_at);
      const daysAgo = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7) {
        const dow = d.getDay();
        counts[dow === 0 ? 6 : dow - 1]++;
      }
    }
    const maxCount = Math.max(...counts, 1);
    return { bars: dayLabels.map((day, i) => ({ day, count: counts[i], isToday: i === todayIdx })), maxCount };
  }, [historyEntries]);

  const streak = useMemo(() => {
    if (historyEntries.length === 0) return 0;
    const dateStrings = new Set(historyEntries.map(e => new Date(e.created_at).toDateString()));
    const check = new Date();
    check.setHours(0, 0, 0, 0);
    let count = 0;
    while (dateStrings.has(check.toDateString())) {
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  }, [historyEntries]);

  if (loading) {
    return (
      <div className="w-full">
        <PageHeader
          eyebrow={t('history.eyebrow') || 'THE LEDGER'}
          title={t('history.generation_history')}
          descriptor={t('history.history_desc')}
          className="mb-8"
        />
        <ScholarCard variant="default" padding="lg">
          <ScholarSkeleton count={4} height="1.25rem" />
        </ScholarCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <ScholarCard variant="default" padding="lg">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-2">{t('history.error_loading')}</h3>
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark mb-4">{error}</p>
            <ScholarButton
              variant="primary"
              onClick={() => fetchHistory()}
              icon={<RefreshCw className="h-4 w-4" />}
              iconPosition="left"
              className="mx-auto"
            >
              {t('history.try_again')}
            </ScholarButton>
          </div>
        </ScholarCard>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {/* PageHeader with sort + Export */}
      <PageHeader
        eyebrow={t('history.eyebrow') || 'The Ledger'}
        title={t('history.generation_history') || 'History'}
        descriptor={t('history.history_desc') || 'everything you have done, in order.'}
        className="mb-5"
        actions={
          <div className="flex items-center gap-3">
            <select
              value={sortOption}
              onChange={(e) => {
                ErrorLogger.debug('Sort option changed', { component: 'HistoryPage', action: 'handleSortChange', newSortOption: e.target.value });
                setSortOption(e.target.value);
              }}
              className="px-3 py-1.5 text-xs border border-divider dark:border-divider-on-dark rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold bg-chip dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark cursor-pointer"
            >
              <option value="created_at_desc">{t('history.creation_newest')}</option>
              <option value="created_at_asc">{t('history.creation_oldest')}</option>
              <option value="filename_asc">{t('history.filename_az')}</option>
              <option value="filename_desc">{t('history.filename_za')}</option>
            </select>
            <button
              type="button"
              className="px-4 py-[7px] border border-divider dark:border-divider-on-dark bg-transparent text-[12px] text-secondary-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark transition-colors"
              style={{ borderRadius: 2 }}
            >
              Export →
            </button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="flex bg-sidebar mb-5">
        {[
          { label: 'items this week', value: String(itemsThisWeek) },
          { label: 'study time', value: '—' },
          { label: 'exams taken', value: '—' },
          { label: 'rooms joined', value: '—' },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className={`flex-1 py-3.5 px-5 text-center${i < arr.length - 1 ? ' border-r border-card-light/10' : ''}`}
          >
            <div className="font-display text-[24px] font-bold text-card-light leading-none">{value}</div>
            <div className="text-[9px] tracking-[2px] uppercase text-accent-gold mt-1.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex mb-[22px] border-b border-divider dark:border-divider-on-dark">
        {(['All', 'Library', 'Rooms', 'Exams', 'EduPlay'] as const).map((f) => {
          const active = filterTab === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilterTab(f)}
              className={`px-[18px] py-[6px] bg-transparent text-[12.5px] cursor-pointer -mb-px transition-colors focus:outline-none border-b-2 ${
                active
                  ? 'border-accent-gold text-ink dark:text-ink-on-dark font-bold'
                  : 'border-transparent text-muted-ink dark:text-muted-ink-on-dark font-normal hover:text-ink dark:hover:text-ink-on-dark'
              }`}
            >
              {f}
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark self-center pr-1">
          {filteredEntries.length} items
        </span>
      </div>

      {/* Two-column body: 1fr 260px */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 260px' }}>
        {/* Left: date-grouped activity feed */}
        <div>
          {historyEntries.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <History className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
              <h3 className="font-display text-xl text-ink dark:text-ink-on-dark mb-2">{t('history.no_history')}</h3>
              <p className="text-secondary-ink dark:text-secondary-ink-on-dark max-w-sm">
                {t('history.process_first')}
              </p>
            </div>
          ) : groupedEntries.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-muted-ink dark:text-muted-ink-on-dark">
              No items match this filter.
            </div>
          ) : (
            groupedEntries.map(({ date, items }, gi) => (
              <div key={gi} className="mb-[22px]">
                {/* Date group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold whitespace-nowrap">{date}</div>
                  <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
                </div>
                {items.map((entry, ii) => (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-[14px] py-[14px]${ii < items.length - 1 ? ' border-b border-divider dark:border-divider-on-dark' : ''}`}
                  >
                    <div
                      className="flex-shrink-0 self-stretch"
                      style={{ width: 3, background: TYPE_COLOR, minHeight: 44, borderRadius: 2 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-[5px]">
                        <span
                          className="text-[9px] font-bold tracking-[1.2px] px-2 py-0.5 border"
                          style={{ color: TYPE_COLOR, borderColor: `${TYPE_COLOR}44` }}
                        >
                          LIBRARY
                        </span>
                        <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                          {formatTime(entry.created_at)}
                        </span>
                      </div>
                      <div className="font-display text-[14.5px] font-semibold text-ink dark:text-ink-on-dark leading-snug mb-[3px]">
                        {entry.original_file_name || t('common.unknown')}
                      </div>
                      <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">
                        {entry.flashcards_json.length > 0 ? (
                          <span>Summary + {entry.flashcards_json.length} flashcards generated</span>
                        ) : (
                          <span>Processed</span>
                        )}
                        {entry.topics?.length ? (
                          <span> · {entry.topics.slice(0, 2).join(', ')}</span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewHistoryEntry ? onViewHistoryEntry(entry) : navigate(`/view/history/${entry.id}`)}
                      className="flex-shrink-0 px-3 py-1 border border-divider dark:border-divider-on-dark bg-transparent text-[11px] text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark transition-colors mt-0.5"
                      style={{ borderRadius: 2 }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Right rail: 260px */}
        <div className="flex flex-col gap-[14px]">
          {/* Weekly bar chart */}
          <div className="border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark" style={{ padding: '16px 18px' }}>
            <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[14px]">This Week</div>
            <div className="flex items-end gap-[6px] mb-2" style={{ height: 60 }}>
              {weekBarData.bars.map(({ day, count, isToday }, i) => {
                const barH = count === 0 ? 4 : Math.max(4, Math.round((count / weekBarData.maxCount) * 52) + 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full"
                      style={{
                        height: barH,
                        background: isToday ? 'var(--color-accent-gold)' : 'var(--color-accent-gold-soft)',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                    <span
                      className="text-[9px]"
                      style={{ color: isToday ? 'var(--color-accent-gold)' : undefined, fontWeight: isToday ? 700 : 400 }}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
              {historyEntries.length} events · 7 days
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-sidebar" style={{ padding: '18px 18px' }}>
            <div className="text-[9px] tracking-[2px] uppercase font-bold mb-2" style={{ color: 'rgba(255,255,255,0.27)' }}>
              Current Streak
            </div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-[48px] font-bold text-ink-on-dark leading-none">{streak}</div>
              <span className="text-[14px] text-accent-gold">days</span>
            </div>
            <div className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.27)' }}>
              Best: — · All time
            </div>
          </div>

          {/* Top Categories */}
          <div className="border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark" style={{ padding: '16px 18px' }}>
            <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[14px]">Top Categories</div>
            {[
              { label: 'Library', pct: historyEntries.length > 0 ? 100 : 0, color: '#5B7A3A' },
              { label: 'Exams', pct: 0, color: '#B8893A' },
              { label: 'EduPlay', pct: 0, color: '#C5708A' },
              { label: 'Rooms', pct: 0, color: '#3A6B8A' },
            ].map(({ label, pct, color }, i) => (
              <div key={label} className={i < 3 ? 'mb-3' : ''}>
                <div className="flex justify-between mb-[5px]">
                  <span className="text-[12px] text-secondary-ink dark:text-muted-ink-on-dark">{label}</span>
                  <span className="font-display text-[11px] font-semibold text-accent-gold">{pct}%</span>
                </div>
                <div className="bg-divider dark:bg-divider-on-dark" style={{ height: 3, borderRadius: 1 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
  );
});
