import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { SummaryDisplay } from './SummaryDisplay';
import { FlashcardViewer } from './FlashcardViewer';
import { ErrorLogger } from '../../utils/errorLogger';

interface SharedItem {
  id: string;
  title: string;
  summary_text: string;
  flashcards_json: Array<{ front: string; back: string }>;
  original_text_content?: string;
  topics?: string[];
  created_at: string;
}

const isMedicalContent = (item: SharedItem) => {
  const medKeywords = ['cardiology', 'neurology', 'medicine', 'clinical', 'pathology', 'anatomy', 'physiology'];
  return item.title.toLowerCase().includes('medical') ||
    item.topics?.some(topic => medKeywords.some(med => topic.toLowerCase().includes(med))) || false;
};

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('share.content_not_available')}</h3>
            <p className="text-muted-foreground mb-4">
              {error || t('share.invalid_link')}
            </p>
            <a
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition duration-150"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t('share.visit_meshfahem')}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const medicalMode = isMedicalContent(item);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('app_name')}</h1>
                <p className="text-xs text-muted-foreground">{t('share.shared_content')}</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-accent transition duration-150 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{t('share.get_meshfahem')}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-card rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{item.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{item.flashcards_json.length} {item.flashcards_json.length === 1 ? t('common.flashcard') : t('common.flashcards')}</span>
            </div>
            {item.topics && item.topics.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-sm font-medium text-muted-foreground">{t('common.topics')}:</span>
                <div className="flex flex-wrap gap-2">
                  {item.topics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <SummaryDisplay
            summaryChunks={[item.summary_text]}
            flashcards={item.flashcards_json}
            originalText={item.original_text_content || ''}
            topics={item.topics || []}
            medicalMode={medicalMode}
            onPublishToLibrary={() => Promise.resolve(false)}
            onReset={() => {}}
            isSharedView={true}
          />

          {item.flashcards_json.length > 0 && (
            <FlashcardViewer
              flashcards={item.flashcards_json}
              medicalMode={medicalMode}
            />
          )}
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="bg-primary p-1 rounded">
                <FileText className="h-4 w-4 text-primary-foreground" />
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
