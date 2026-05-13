import React from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';

export interface AudioSummaryGeneratorProps {
  isGenerating: boolean;
  hasTranscript: boolean;
  onGenerateRequestedContent?: () => void;
  generatedText?: {
    summaryText?: string;
    explanationText?: string;
  };
}

/**
 * Placeholder for generating summary/explanation from transcript.
 * No API activation yet.
 */
export const AudioSummaryGenerator: React.FC<AudioSummaryGeneratorProps> = ({
  isGenerating,
  hasTranscript,
  onGenerateRequestedContent,
  generatedText
}) => {
  const { t } = useI18n();

  const canGenerate = hasTranscript && !isGenerating;

  return (
    <div className={`bg-card-light dark:bg-card-dark border border border-divider dark:border-divider-on-dark rounded-[12px]`}>
      <div className="p-4 border-b" style={{ borderColor: 'transparent' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <h3 className={`font-semibold text-ink dark:text-ink-on-dark`}>{t('audio_study.generate_title') || 'Generate Study Tools'}</h3>
          </div>
        </div>
        <p className={`text-muted-ink dark:text-muted-ink-on-dark text-sm mt-1`}>
          {t('audio_study.generate_desc') || 'Transcription -> summary/explanation (coming soon).'}
        </p>
      </div>

      <div className="p-4">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={onGenerateRequestedContent}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-[12px] transition duration-150 ${
            !canGenerate
              ? `opacity-60 cursor-not-allowed text-muted-ink dark:text-muted-ink-on-dark`
              : `bg-accent-gold text-white hover:opacity-90`
          }`}
        >
          {isGenerating ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{isGenerating ? (t('audio_study.generating') || 'Generating...') : (t('audio_study.generate_from_transcript') || 'Generate from transcript')}</span>
        </button>

        {generatedText ? (
          <div className="mt-4">
            {generatedText.summaryText ? (
              <div className="mb-3">
                <h4 className={`font-semibold text-ink dark:text-ink-on-dark`}>{t('audio_study.summary') || 'Summary'}</h4>
                <div className={`text-sm whitespace-pre-wrap text-secondary-ink dark:text-secondary-ink-on-dark`}>{generatedText.summaryText}</div>
              </div>
            ) : null}
            {generatedText.explanationText ? (
              <div>
                <h4 className={`font-semibold text-ink dark:text-ink-on-dark`}>{t('audio_study.explanation') || 'Clearer Explanation'}</h4>
                <div className={`text-sm whitespace-pre-wrap text-secondary-ink dark:text-secondary-ink-on-dark`}>{generatedText.explanationText}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

