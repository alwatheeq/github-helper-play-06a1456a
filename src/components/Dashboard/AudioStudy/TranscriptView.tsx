import React from 'react';
import { FileText } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';

export interface TranscriptViewProps {
  transcriptText: string;
  languageHint?: string;
  onGenerateRequestedContent?: () => void;
  isGenerating?: boolean;
}

/**
 * Transcript UI placeholder.
 *
 * Per requirements: doesn't actually perform speech-to-text.
 */
export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcriptText,
  languageHint,
  onGenerateRequestedContent,
  isGenerating = false
}) => {
  const { t } = useI18n();

  const hasText = transcriptText.trim().length > 0;

  return (
    <div className={`bg-card-light dark:bg-card-dark border border border-divider dark:border-divider-on-dark rounded-lg`}>
      <div className="p-4 border-b" style={{ borderColor: 'transparent' }}>
        <div className="flex items-center gap-2">
          <FileText className={`h-4 w-4 text-ink dark:text-ink-on-dark`} />
          <h3 className={`font-semibold text-ink dark:text-ink-on-dark`}>{t('audio_study.transcript_title') || 'Transcript'}</h3>
          {languageHint ? (
            <span className={`text-xs text-muted-ink dark:text-muted-ink-on-dark`}>{languageHint}</span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {hasText ? (
          <div className={`text-sm whitespace-pre-wrap text-secondary-ink dark:text-secondary-ink-on-dark leading-relaxed`}>
            {transcriptText}
          </div>
        ) : (
          <div className={`text-sm text-muted-ink dark:text-muted-ink-on-dark`}>{t('audio_study.no_transcript') || 'Transcript will appear here.'}</div>
        )}

        {onGenerateRequestedContent ? (
          <div className="mt-4">
            <button
              type="button"
              disabled={!hasText || isGenerating}
              onClick={onGenerateRequestedContent}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition duration-150 ${
                !hasText || isGenerating
                  ? `opacity-60 cursor-not-allowed text-muted-ink dark:text-muted-ink-on-dark`
                  : `bg-gradient-to-r from-accent-gold to-accent-gold-soft text-white hover:opacity-90`
              }`}
            >
              {isGenerating ? (t('audio_study.generating') || 'Generating...') : (t('audio_study.generate_from_transcript') || 'Generate summary/explanation')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

