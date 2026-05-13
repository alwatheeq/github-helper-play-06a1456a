import React, { useCallback, useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { ChatAssistant } from '../../ChatAssistant/ChatAssistant';

interface CourseTutorProps {
  courseId: string;
  courseName: string;
  topicName: string;
}

export const CourseTutor: React.FC<CourseTutorProps> = ({ courseId, courseName, topicName }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();

  const [context, setContext] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadContext = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: courseItems, error: itemsErr } = await supabase
        .from('academics_course_items')
        .select('item_id')
        .eq('course_id', courseId);

      if (itemsErr) throw itemsErr;

      const itemIds = (courseItems || []).map((ci) => ci.item_id);
      if (itemIds.length === 0) {
        setContext('');
        setLoading(false);
        return;
      }

      const { data: libraryItems, error: libErr } = await supabase
        .from('user_library_items')
        .select('summary_text')
        .in('id', itemIds);

      if (libErr) throw libErr;

      const summaries = (libraryItems || [])
        .map((item) => (typeof item.summary_text === 'string' ? item.summary_text : ''))
        .filter(Boolean);

      setItemCount(itemIds.length);
      setContext(summaries.join('\n\n---\n\n'));
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user, courseId, showErrorToast]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const suggestedPrompts = [
    t('ai_tutor.prompt_explain') || 'Explain the key concepts',
    t('ai_tutor.prompt_quiz') || 'Quiz me on this material',
    t('ai_tutor.prompt_summary') || 'Give me a quick summary',
    t('ai_tutor.prompt_weak') || 'What should I focus on?',
  ];

  if (loading) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6">
        <div className="animate-pulse text-sm text-muted-ink dark:text-muted-ink-on-dark">
          {t('ai_tutor.loading') || 'Loading tutor…'}
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="bg-card-dark border border-divider rounded-[var(--s4-radius-card)] p-8 text-center" dir={dir}>
        <Bot className="h-8 w-8 text-muted-ink-on-dark mx-auto mb-3" />
        <p className="text-sm text-muted-ink-on-dark">
          {t('ai_tutor.no_context') || 'Upload materials to this course to enable the AI tutor'}
        </p>
      </div>
    );
  }

  return (
    /* Aca4Tutor: split 70/30 layout */
    <div
      className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] overflow-hidden"
      dir={dir}
    >
      {/* Context bar */}
      <div className="flex items-center gap-3 px-7 py-3 border-b border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark">
        <div className="p-1.5 rounded-[4px] bg-accent-gold-soft text-accent-gold">
          <Bot className="h-4 w-4" />
        </div>
        <span className="font-semibold text-sm text-ink dark:text-ink-on-dark">
          {t('ai_tutor.title') || 'AI Course Tutor'}
        </span>
        {courseName && (
          <>
            <span className="text-muted-ink dark:text-muted-ink-on-dark text-sm">·</span>
            <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">{courseName}</span>
          </>
        )}
        <span className="ms-auto text-xs text-muted-ink dark:text-muted-ink-on-dark">
          {itemCount > 0
            ? (t('ai_tutor.materials_count', { count: itemCount }) || `${itemCount} materials in context`)
            : ''}
        </span>
      </div>

      {/* Split panel */}
      <div className="flex min-h-0" style={{ minHeight: '480px' }}>
        {/* Chat area — 70% */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Suggested prompt chips */}
          <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <span
                key={p}
                className="px-3 py-1 rounded-full bg-chip dark:bg-bg-chip border border-divider dark:border-divider-on-dark text-xs text-secondary-ink dark:text-muted-ink-on-dark"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Chat thread */}
          <div className="flex-1 overflow-y-auto p-5">
            <ChatAssistant
              summaryText={context}
              topics={[topicName]}
              contextType="summary"
              medicalMode={false}
            />
          </div>
        </div>

        {/* Context panel — 30% */}
        <aside className="w-64 shrink-0 border-s border-divider dark:border-divider-on-dark bg-card-dark flex flex-col p-5 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-ink-on-dark uppercase tracking-widest mb-1">
              {t('ai_tutor.context_label') || 'Context'}
            </p>
            <p className="font-display text-base font-semibold text-ink-on-dark leading-snug">
              {courseName || topicName}
            </p>
            {topicName && courseName !== topicName && (
              <p className="text-xs text-muted-ink-on-dark mt-0.5">{topicName}</p>
            )}
          </div>
          <div className="h-px bg-divider" />
          <div>
            <p className="text-xs font-semibold text-muted-ink-on-dark uppercase tracking-widest mb-2">
              {t('ai_tutor.materials_label') || 'Materials'}
            </p>
            <p className="text-2xl font-bold text-ink-on-dark">{itemCount}</p>
            <p className="text-xs text-muted-ink-on-dark mt-0.5">
              {t('ai_tutor.documents_loaded') || 'documents loaded'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
