import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';
import { SummaryDisplay } from './Dashboard/SummaryDisplay';
import { FlashcardViewer } from './Dashboard/FlashcardViewer';
import { ErrorLogger } from '../utils/errorLogger';

interface SharedItem {
  id: string;
  title: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  topics?: string[];
  created_at: string;
}

export const ShareView: React.FC = () => {
  const { shareableLinkId } = useParams<{ shareableLinkId: string }>();
  const { t } = useI18n();
  const [item, setItem] = useState<SharedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareableLinkId) {
      fetchSharedItem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchSharedItem is stable; including it would cause infinite refetches
  }, [shareableLinkId]);

  const fetchSharedItem = async () => {
    if (!shareableLinkId) {
      setError(t('share.invalid_link'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_library_items')
        .select('id, title, summary_text, flashcards_json, original_text_content, topics, created_at')
        .eq('shareable_link', shareableLinkId)
        .eq('is_public', true)
        .single();

      if (fetchError || !data) {
        throw new Error(t('share.content_not_available'));
      }

      setItem(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'ShareView', action: 'fetchSharedItem', shareableLinkId });
      setError(err instanceof Error ? err.message : t('share.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold mr-3"></div>
            <span className="text-muted-ink dark:text-muted-ink-on-dark">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8 max-w-md mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-2">{t('share.content_not_available')}</h3>
            <p className="text-secondary-ink dark:text-muted-ink-on-dark mb-4">
              {error || t('share.invalid_link')}
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-gold text-ink-on-dark hover:opacity-90 transition duration-150"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t('share.visit_meshfahem')}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex flex-col">
      {/* Branded dark header */}
      <header className="bg-sidebar dark:bg-sidebar h-[52px] flex items-center px-5 gap-3.5 flex-shrink-0 border-b border-divider/20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] bg-accent-gold rounded-[6px] flex items-center justify-center flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-ink-on-dark" />
          </div>
          <span className="text-sm font-semibold text-ink-on-dark">{t('app_name')}</span>
        </div>

        <div className="w-px h-[18px] bg-white/15 flex-shrink-0" />

        {/* Document title */}
        <span className="text-sm font-medium text-ink-on-dark/80 truncate flex-1">
          {item.title}
        </span>

        {/* Shared badge */}
        <span className="text-[11px] font-medium text-ink-on-dark/60 whitespace-nowrap flex-shrink-0">
          {t('share.shared_content')}
        </span>

        {/* CTA */}
        <a
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-gold/50 rounded-[7px] text-xs font-medium text-accent-gold hover:bg-accent-gold/10 transition duration-150 flex-shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{t('share.get_meshfahem')}</span>
        </a>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Title card */}
        <div className="mb-8">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            <h2 className="font-display text-[22px] font-bold text-ink dark:text-ink-on-dark mb-2" style={{ letterSpacing: '-0.01em' }}>
              {item.title}
            </h2>
            <div className="flex items-center flex-wrap gap-3 text-sm text-muted-ink dark:text-muted-ink-on-dark">
              <span>{t('common.created', { date: formatDate(item.created_at) })}</span>
              <span>·</span>
              {/* Flashcard count badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-gold-soft/20 text-accent-gold text-xs font-semibold rounded-full">
                {item.flashcards_json.length} {item.flashcards_json.length === 1 ? t('common.flashcard') : t('common.flashcards')}
              </span>
            </div>

            {/* Topics */}
            {item.topics && item.topics.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark">{t('common.topics')}:</span>
                {item.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-accent-gold-soft/30 text-accent-gold text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Create your own CTA */}
            <div className="mt-5 pt-5 border-t border-divider dark:border-divider-on-dark flex items-center justify-between">
              <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                Study smarter with AI-powered summaries and flashcards.
              </p>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-sidebar text-card-light text-sm font-bold rounded-[8px] hover:opacity-85 transition-opacity whitespace-nowrap"
              >
                Create your own
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SummaryDisplay
            summaryChunks={[item.summary_text]}
            flashcards={item.flashcards_json}
            originalText={item.original_text_content || ''}
            topics={item.topics || []}
            onPublishToLibrary={() => Promise.resolve(false)} // Disabled for shared view
            onReset={() => {}} // Disabled for shared view
            isSharedView={true}
            highlightLibraryItemId={item.id}
          />

          {item.flashcards_json.length > 0 && (
            <FlashcardViewer
              flashcards={item.flashcards_json}
              itemId={item.id}
              contextSummary={item.summary_text}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card-light dark:bg-card-dark border-t border-divider dark:border-divider-on-dark mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-2 text-muted-ink dark:text-muted-ink-on-dark">
            <div className="bg-accent-gold p-1 rounded">
              <FileText className="h-4 w-4 text-ink-on-dark" />
            </div>
            <span className="text-sm">
              {t('share.powered_by')} <strong>{t('app_name')}</strong> — {t('share.ai_powered_learning')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
