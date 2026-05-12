import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, AlertCircle, RefreshCw, Clock } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStoredUntil = (expiresAt: string) => {
    const expiresDate = new Date(expiresAt);
    return expiresDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isMedicalEntry = (entry: HistoryEntry) =>
    entry.original_file_name?.toLowerCase().includes('medical') ||
    entry.topics?.some(topic => ['cardiology', 'neurology', 'medicine', 'clinical'].some(med => topic.toLowerCase().includes(med)));

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
      {/* Scholar v4 PageHeader */}
      <PageHeader
        eyebrow={t('history.eyebrow') || 'The Ledger'}
        title={t('history.generation_history') || 'History'}
        descriptor={t('history.history_desc') || 'everything you have done, in order.'}
        className="mb-5"
        actions={
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-secondary-ink dark:text-secondary-ink-on-dark sr-only">{t('history.sort_by')}</label>
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
          </div>
        }
      />

      {/* v4 Stats strip — dark ink bar, 4 items */}
      {historyEntries.length > 0 && (() => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const itemsThisWeek = historyEntries.filter(e => new Date(e.created_at).getTime() >= oneWeekAgo).length;
        const totalCards = historyEntries.reduce((sum, e) => sum + (e.flashcards_json?.length || 0), 0);
        const uniqueTopics = new Set(historyEntries.flatMap(e => e.topics || [])).size;
        const stats = [
          { label: 'items this week', value: String(itemsThisWeek) },
          { label: 'total items', value: String(historyEntries.length) },
          { label: 'total cards', value: String(totalCards) },
          { label: 'topics covered', value: String(uniqueTopics) },
        ];
        return (
          <div className="flex bg-sidebar mb-5">
            {stats.map(({ label, value }, i) => (
              <div
                key={label}
                className={`flex-1 py-3.5 px-5 text-center ${i < stats.length - 1 ? 'border-r border-card-light/10' : ''}`}
              >
                <div className="font-display text-[24px] font-bold text-card-light leading-none">{value}</div>
                <div className="text-[9px] tracking-[2px] uppercase text-accent-gold mt-1.5">{label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {historyEntries.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <History className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink dark:text-ink-on-dark mb-2">{t('history.no_history')}</h3>
          <p className="text-secondary-ink dark:text-secondary-ink-on-dark max-w-sm">
            {t('history.process_first')}
          </p>
        </div>
      ) : (
        /* Scholar v4 Hist4: table-like list with roman numerals, hairline rows, row hover */
        <div className="border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark overflow-hidden">
          {historyEntries.map((entry, index) => {
            const medical = isMedicalEntry(entry);
            const accentColor = medical ? '#9C2B2B' : '#5B7A3A';
            const typeLabel = medical ? 'MEDICAL' : 'LIBRARY';
            return (
              <div
                key={entry.id}
                className={`group flex items-start gap-3.5 py-3.5 pl-0 pr-5 hover:bg-subtle/60 dark:hover:bg-subtle-on-dark/20 transition-colors duration-[var(--s4-dur-fast)] ${
                  index < historyEntries.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                }`}
              >
                {/* Left accent bar */}
                <div className="self-stretch w-[3px] flex-shrink-0 rounded-sm min-h-[44px]" style={{ background: accentColor }} />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Type badge + time */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[9px] font-bold tracking-[1.2px] px-2 py-0.5 border"
                      style={{ color: accentColor, borderColor: `${accentColor}44` }}
                    >
                      {typeLabel}
                    </span>
                    <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>

                  {/* Filename */}
                  <div className="font-display text-[14.5px] font-semibold text-ink dark:text-ink-on-dark leading-snug mb-0.5">
                    {entry.original_file_name || t('common.unknown')}
                  </div>

                  {/* Meta: cards + topics */}
                  <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">
                    {entry.flashcards_json.length > 0 && (
                      <span>{entry.flashcards_json.length} cards generated</span>
                    )}
                    {entry.topics?.length ? (
                      <span> · {entry.topics.slice(0, 2).join(', ')}</span>
                    ) : null}
                    {entry.expires_at && (
                      <span className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 flex-shrink-0 text-accent-gold" />
                        {t('history.expires_on', { date: formatStoredUntil(entry.expires_at) })}
                      </span>
                    )}
                  </div>
                </div>

                {/* View button */}
                <button
                  type="button"
                  onClick={() => onViewHistoryEntry ? onViewHistoryEntry(entry) : navigate(`/view/history/${entry.id}`)}
                  className="flex-shrink-0 px-3 py-1 border border-divider dark:border-divider-on-dark bg-transparent text-[11px] text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark transition-colors duration-[var(--s4-dur-fast)] mt-0.5"
                >
                  View
                </button>
              </div>
            );
          })}
        </div>
      )}

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
