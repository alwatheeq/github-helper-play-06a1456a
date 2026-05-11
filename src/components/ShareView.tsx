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
        <div className="bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-hairline)] border border-divider dark:border-divider-on-dark p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold mr-3"></div>
            <span className="text-secondary-ink dark:text-muted-ink-on-dark">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-hairline)] border border-divider dark:border-divider-on-dark p-8 max-w-md mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-2">{t('share.content_not_available')}</h3>
            <p className="text-secondary-ink dark:text-muted-ink-on-dark mb-4">
              {error || t('share.invalid_link')}
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-gold text-white rounded-[var(--s4-radius-card)] hover:opacity-90 transition duration-150"
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
    <div className="min-h-screen bg-page-light dark:bg-page-dark">
      {/* Header */}
      <header className="bg-card-light dark:bg-card-dark shadow-[var(--s4-shadow-hairline)] border-b border-divider dark:border-divider-on-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Left: Logo + Meshfahem */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-accent-gold p-2 rounded-[var(--s4-radius-card)]">
                <FileText className="h-6 w-6 text-ink-on-dark" />
              </div>
              <div>
                <h1 className="s4-h3 text-[20px] text-ink dark:text-ink-on-dark">{t('app_name')}</h1>
                <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{t('share.shared_content')}</p>
              </div>
            </div>

            {/* Middle: Tagline */}
            <div className="flex-1 flex justify-center px-2 sm:px-4 min-w-0">
              <p className="text-xs sm:text-sm text-secondary-ink dark:text-muted-ink-on-dark italic text-center whitespace-nowrap truncate">
                this is just beginning, there is better to come
              </p>
            </div>

            {/* Right: Get Meshfahem button */}
            <div className="flex-shrink-0">
              <a
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-accent-gold hover:opacity-80 border border-accent-gold/40 rounded-[var(--s4-radius-card)] hover:bg-accent-gold-soft/10 transition duration-150 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t('share.get_meshfahem')}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[var(--s4-shadow-hairline)] border border-divider dark:border-divider-on-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="s4-h2 text-ink dark:text-ink-on-dark mb-2">{item.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-ink dark:text-muted-ink-on-dark">
                  <span>{t('common.created', { date: formatDate(item.created_at) })}</span>
                  <span>•</span>
                  <span>{item.flashcards_json.length} {item.flashcards_json.length === 1 ? t('common.flashcard') : t('common.flashcards')}</span>
                </div>
                
                {/* Topics */}
                {item.topics && item.topics.length > 0 && (
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-sm font-medium text-muted-ink dark:text-muted-ink-on-dark">{t('common.topics')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {item.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent-gold-soft/30 text-accent-gold text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-muted-ink dark:text-muted-ink-on-dark">
              <div className="bg-accent-gold p-1 rounded">
                <FileText className="h-4 w-4 text-ink-on-dark" />
              </div>
              <span className="text-sm">
                {t('share.powered_by')} <strong>{t('app_name')}</strong> - {t('share.ai_powered_learning')}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
