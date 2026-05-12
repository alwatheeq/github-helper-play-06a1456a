import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, AlertCircle, RefreshCw, Clock, Stethoscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { ScholarCard, ScholarButton, ScholarBadge, PageHeader, ScholarSkeleton } from '../Scholar';

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

  // Roman numeral helper (up to 20 items covers typical history pages)
  const toRoman = (n: number): string => {
    const vals = [10, 9, 5, 4, 1];
    const syms = ['x', 'ix', 'v', 'iv', 'i'];
    let result = '';
    for (let i = 0; i < vals.length; i++) {
      while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
    }
    return result;
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Scholar v4 PageHeader */}
      <PageHeader
        eyebrow={t('history.eyebrow') || 'THE LEDGER'}
        title={t('history.generation_history')}
        descriptor={t('history.history_desc')}
        className="mb-8"
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
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-hairline)] overflow-hidden">
          {historyEntries.map((entry, index) => {
            const medical = isMedicalEntry(entry);
            return (
              <div
                key={entry.id}
                className={`group flex items-start gap-5 px-6 py-4 hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors duration-[var(--s4-dur-fast)] ${
                  index < historyEntries.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                }`}
              >
                {/* Roman numeral column */}
                <div className="flex-shrink-0 w-8 pt-0.5">
                  <span className="font-display text-sm text-accent-gold font-semibold select-none">
                    {toRoman(index + 1)}.
                  </span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Filename + medical badge */}
                  <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-ink dark:text-ink-on-dark leading-snug">
                      {entry.original_file_name || t('common.unknown')}
                    </span>
                    {medical && (
                      <ScholarBadge variant="danger">Medical</ScholarBadge>
                    )}
                  </div>

                  {/* Output type + topic chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {/* Input type chip */}
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                      {entry.original_input_type === 'file' ? t('history.file_upload') : t('history.text_input')}
                    </span>
                    {/* Cards count chip */}
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                      {entry.flashcards_json.length} {entry.flashcards_json.length === 1 ? t('common.flashcard') : t('common.flashcards')}
                    </span>
                    {/* Topic chips */}
                    {entry.topics?.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full bg-chip dark:bg-card-dark border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark whitespace-nowrap"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center gap-1 text-xs text-muted-ink dark:text-muted-ink-on-dark">
                    <Clock className="h-3 w-3 flex-shrink-0 text-accent-gold" />
                    <span>{t('history.expires_on', { date: formatStoredUntil(entry.expires_at) })}</span>
                  </div>
                </div>

                {/* Relative date + Open button */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-0.5">
                  <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                    {formatDate(entry.created_at)}
                  </span>
                  <ScholarButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewHistoryEntry ? onViewHistoryEntry(entry) : navigate(`/view/history/${entry.id}`)}
                  >
                    {t('history.view_content')}
                  </ScholarButton>
                </div>
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
