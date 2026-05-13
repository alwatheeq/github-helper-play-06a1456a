import React from 'react';
import { Volume2, Pause, Square } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useTTS } from '../../../hooks/useTTS';

export interface AudioTtsPlayerProps {
  textToPlay: string;
  lang?: string;
}

export const AudioTtsPlayer: React.FC<AudioTtsPlayerProps> = ({ textToPlay, lang = 'en-US' }) => {
  const { t } = useI18n();
  const { speak, stop, pause, resume, isSpeaking, isPaused, error } = useTTS({ lang });

  const hasText = (textToPlay ?? '').trim().length > 0;

  return (
    <div className={`flex items-center gap-3 p-3 border border border-divider dark:border-divider-on-dark rounded-[12px]`}>
      {isSpeaking ? (
        <>
          <button
            type="button"
            onClick={pause}
            className={`inline-flex items-center justify-center rounded-md px-3 py-2 transition duration-150 bg-accent-gold text-white hover:opacity-90`}
            aria-label={t('audio_study.pause_audio') || 'Pause'}
            title={t('audio_study.pause_audio') || 'Pause'}
          >
            <Pause className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 transition duration-150 bg-red-500 text-white hover:bg-red-600"
            aria-label={t('audio_study.stop_audio') || 'Stop'}
            title={t('audio_study.stop_audio') || 'Stop'}
          >
            <Square className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={!hasText}
          onClick={() => {
            if (!hasText) return;
            // Distinguish "paused mid-speech" from "idle / never started".
            if (isPaused) {
              resume();
            } else {
              speak(textToPlay);
            }
          }}
          className={`inline-flex items-center justify-center rounded-md px-3 py-2 transition duration-150 ${
            !hasText
              ? `opacity-60 cursor-not-allowed text-muted-ink dark:text-muted-ink-on-dark`
              : `bg-accent-gold text-white hover:opacity-90`
          }`}
          aria-label={isPaused ? (t('audio_study.resume_audio') || 'Resume') : (t('audio_study.play_audio') || 'Read aloud')}
          title={isPaused ? (t('audio_study.resume_audio') || 'Resume') : (t('audio_study.play_audio') || 'Read aloud')}
        >
          <Volume2 className="h-4 w-4" />
        </button>
      )}

      {error ? (
        <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <div className={`text-sm text-muted-ink dark:text-muted-ink-on-dark`}>
          {isSpeaking
            ? t('audio_study.speaking') || 'Speaking…'
            : isPaused
            ? t('audio_study.paused') || 'Paused'
            : t('audio_study.tts_ready') || 'Click to read aloud'}
        </div>
      )}
    </div>
  );
};
