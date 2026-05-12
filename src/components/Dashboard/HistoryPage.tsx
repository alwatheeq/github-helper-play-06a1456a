import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, FileText, Calendar, AlertCircle, RefreshCw, Tag, Clock, Stethoscope } from 'lucide-react';
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

  return (
    <div className="w-full overflow-hidden">
      <PageHeader
        eyebrow={t('history.eyebrow') || 'THE LEDGER'}
        title={t('history.generation_history')}
        descriptor={t('history.history_desc')}
        className="mb-8"
      />

      {/* Sorting Controls */}
      <ScholarCard variant="default" padding="md" className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-chip dark:bg-card-dark p-2 rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark">
              <History className="h-5 w-5 text-accent-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark">{t('history.sort_options')}</h3>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('history.sort_desc')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-secondary-ink dark:text-secondary-ink-on-dark">{t('history.sort_by')}</label>
            <select
              value={sortOption}
              onChange={(e) => {
                ErrorLogger.debug('Sort option changed', { component: 'HistoryPage', action: 'handleSortChange', newSortOption: e.target.value });
                setSortOption(e.target.value);
              }}
              className="px-3 py-2 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-btn)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus:border-transparent bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark"
            >
              <option value="created_at_desc">{t('history.creation_newest')}</option>
              <option value="created_at_asc">{t('history.creation_oldest')}</option>
              <option value="filename_asc">{t('history.filename_az')}</option>
              <option value="filename_desc">{t('history.filename_za')}</option>
            </select>
          </div>
        </div>
      </ScholarCard>

      {historyEntries.length === 0 ? (
        <ScholarCard variant="default" padding="lg">
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-2">{t('history.no_history')}</h3>
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark">
              {t('history.process_first')}
            </p>
          </div>
        </ScholarCard>
      ) : (
        <div className="space-y-4">
          {historyEntries.map((entry) => {
            const medical = isMedicalEntry(entry);
            return (
              <ScholarCard key={entry.id} variant="default" padding="none" hover className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-[var(--s4-radius-card)] border ${
                        medical
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                          : 'bg-chip dark:bg-card-dark border-divider dark:border-divider-on-dark'
                      }`}>
                        {medical ? (
                          <Stethoscope className="h-5 w-5 text-red-600 dark:text-red-300" />
                        ) : (
                          <FileText className="h-5 w-5 text-accent-gold" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark inline-flex items-center gap-2 flex-wrap">
                          <span>{entry.original_file_name || t('common.unknown')}</span>
                          {medical && (
                            <ScholarBadge variant="danger">Medical</ScholarBadge>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-ink dark:text-muted-ink-on-dark flex-wrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(entry.created_at)}
                          </div>
                          <span className="capitalize">
                            {entry.original_input_type === 'file' ? t('history.file_upload') : t('history.text_input')}
                          </span>
                          <span>
                            {entry.flashcards_json.length} {entry.flashcards_json.length === 1 ? t('common.flashcard') : t('common.flashcards')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ScholarButton
                      variant="primary"
                      size="sm"
                      onClick={() => onViewHistoryEntry ? onViewHistoryEntry(entry) : navigate(`/view/history/${entry.id}`)}
                    >
                      {t('history.view_content')}
                    </ScholarButton>
                  </div>

                  {/* Topics display */}
                  {entry.topics && entry.topics.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-start space-x-2">
                        <Tag className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0 mt-1" />
                        <div className="flex flex-wrap gap-2 min-w-0">
                          {entry.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-chip dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark text-[10px] tracking-[1.5px] font-bold uppercase rounded-[var(--s4-radius-btn)] whitespace-nowrap"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stored until badge */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                      <Clock className="h-4 w-4 flex-shrink-0 text-accent-gold" />
                      <span className="truncate">{t('history.expires_on', { date: formatStoredUntil(entry.expires_at) })}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-ink dark:text-secondary-ink-on-dark mb-2">{t('history.summary_preview')}</h4>
                    <p className="text-secondary-ink dark:text-secondary-ink-on-dark bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-3">
                      {entry.summary_text.length > 150
                        ? entry.summary_text.substring(0, 150) + '...'
                        : entry.summary_text
                      }
                    </p>
                  </div>
                </div>
              </ScholarCard>
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
