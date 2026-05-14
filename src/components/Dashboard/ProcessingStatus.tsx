import React, { useContext, useState, useEffect } from 'react';
import { Loader2, Brain, Zap, Stethoscope, Heart, Activity, Scan } from 'lucide-react';
import { useI18n, I18nContext } from '../../contexts/I18nContext';

interface ProcessingStatusProps {
  stage: 'uploading' | 'processing';
  progress: number;
  message: string;
  mode: 'fast' | 'staged';
  medicalMode?: boolean;
  medicalScore?: number;
  extractionMethod?: string;
  confidence?: number;
  onReset: () => void;
}

// Informational facts array
const generalFacts = [
  "Did you know that taking breaks while studying can improve memory retention by up to 40%?",
  "Have you ever thought about how spaced repetition helps your brain form stronger neural connections?",
  "Interesting fact: The brain processes visual information 60,000 times faster than text!",
  "Fun fact: Active recall (like flashcards) is 50% more effective than passive reading!",
  "Did you know that writing notes by hand improves comprehension compared to typing?",
  "Have you ever considered that teaching others what you've learned helps solidify your own understanding?",
  "Interesting fact: The spacing effect shows that studying over multiple sessions is more effective than cramming!",
  "Fun fact: Your brain creates new neural pathways every time you learn something new!",
  "Did you know that getting enough sleep is crucial for memory consolidation?",
  "Have you ever thought about how different learning styles can optimize your study sessions?",
  "Interesting fact: The Pomodoro Technique (25-minute study blocks) can boost productivity significantly!",
  "Fun fact: Multitasking while studying can reduce learning efficiency by up to 40%!"
];

const medicalFacts = [
  "Did you know that spaced repetition is especially effective for memorizing medical terminology?",
  "Have you ever thought about how clinical case studies help bridge theory and practice?",
  "Interesting fact: Active recall through flashcards improves long-term retention of medical concepts!",
  "Fun fact: Teaching medical concepts to others helps you understand them at a deeper level!",
  "Did you know that visual learning aids like diagrams can help understand complex pathophysiology?",
  "Have you ever considered that breaking down complex medical topics into smaller chunks improves comprehension?",
  "Interesting fact: Regular review of medical content helps prevent the forgetting curve!",
  "Fun fact: Connecting new medical knowledge to existing concepts creates stronger memory associations!"
];

// Internal component that uses hooks
const ProcessingStatusContent: React.FC<ProcessingStatusProps> = ({
  stage: _stage,
  progress,
  message,
  mode,
  medicalMode = false,
  medicalScore,
  extractionMethod,
  confidence,
  onReset
}) => {
  const { t } = useI18n();
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Select facts based on medical mode
  const facts = medicalMode ? medicalFacts : generalFacts;

  // Rotate facts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prevIndex) => (prevIndex + 1) % facts.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [facts.length]);

  const modeLabel = medicalMode
    ? mode === 'fast' ? 'Fast Medical Processing' : 'Comprehensive Medical Analysis'
    : mode === 'fast' ? t('processing.fast_processing') : t('processing.staged_processing');

  const modeDesc = medicalMode
    ? mode === 'fast'
      ? 'Rapid medical content analysis for board exam preparation'
      : 'In-depth clinical analysis with pathophysiology and differential diagnosis focus'
    : mode === 'fast' ? t('processing.fast_desc') : t('processing.staged_desc');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page eyebrow + title — no card border, full-width centred layout (Dash4Proc) */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[2.5px] uppercase text-accent-gold">
              The Workshop · Processing
            </div>
            <h1 className="font-display text-[38px] font-semibold text-ink dark:text-ink-on-dark mt-1.5 mb-1 tracking-tight leading-tight">
              Composing your materials.
            </h1>
            <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark italic">{modeDesc}</p>
          </div>
          {/* Mode badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[1.2px] uppercase border ${
            medicalMode
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-accent-gold-soft border-accent-gold text-accent-gold'
          }`}>
            {mode === 'fast'
              ? <Zap className="h-2.5 w-2.5" />
              : medicalMode ? <Stethoscope className="h-2.5 w-2.5" /> : <Brain className="h-2.5 w-2.5" />
            }
            {modeLabel}
          </div>
        </div>
        <div className="h-px bg-ink/80 mt-3.5 mb-4" />
      </div>

      {/* Progress bar — full-width, accent-gold fill */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12.5px] text-secondary-ink dark:text-muted-ink-on-dark">{message}</span>
          <span className="font-display text-[12px] font-bold text-accent-gold tracking-[0.5px]">{progress}%</span>
        </div>
        <div className="w-full bg-subtle h-[5px]">
          <div
            className={`h-full transition-all duration-200 ease-in-out ${
              medicalMode ? 'bg-red-600' : 'bg-accent-gold'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Two-column layout (Dash4Proc) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[22px]">

        {/* Left — composing panel with editorial left-border accent */}
        <div className="bg-subtle border border-divider border-l-[3px] border-l-accent-gold">
          <div className="px-5 py-3.5 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-[38px] h-[38px] border border-divider flex items-center justify-center flex-shrink-0 ${
                medicalMode ? 'bg-red-50' : 'bg-accent-gold-soft'
              }`}>
                {mode === 'fast'
                  ? medicalMode ? <Activity className="h-5 w-5 text-red-600" /> : <Zap className="h-5 w-5 text-accent-gold" />
                  : medicalMode ? <Stethoscope className="h-5 w-5 text-red-600" /> : <Brain className="h-5 w-5 text-accent-gold" />
                }
              </div>
              <div>
                <div className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark leading-tight">{modeLabel}</div>
                <div className="text-[11px] text-muted-ink mt-0.5">
                  AI extraction · est. 40 seconds remaining
                  {/* OCR Indicator */}
                  {extractionMethod === 'OCR' && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Scan className="h-3 w-3 text-accent-gold" />
                      OCR
                      {confidence !== undefined && (
                        <span className="ml-1 text-accent-gold font-medium">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </span>
                  )}
                  {/* Medical Score */}
                  {medicalMode && medicalScore && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-red-700">{medicalScore}/100</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pull-quote area — rotating fact as an editorial quote */}
          <div className="px-8 py-10 flex items-start gap-[18px]">
            <div className="flex-shrink-0 opacity-55 mt-1">
              <Loader2 className={`h-6 w-6 animate-spin ${medicalMode ? 'text-red-500' : 'text-accent-gold'}`} />
            </div>
            <div>
              <p className="font-display text-[16px] text-ink dark:text-ink-on-dark leading-[1.72] transition-opacity duration-200">
                "{facts[currentFactIndex]}"
              </p>
              <div className="font-display text-[10.5px] text-accent-gold mt-3 tracking-[0.3px]">— Study science</div>
              <div className="text-[11.5px] text-muted-ink mt-3.5">Processing your content in the background.</div>
            </div>
          </div>
        </div>

        {/* Right — dark editorial panel */}
        <div className="bg-sidebar flex flex-col px-[26px] py-6">
          <div className="text-[9px] font-bold tracking-[2.5px] uppercase text-accent-gold mb-[18px]">While you wait</div>
          <p className="font-display text-[15px] text-ink-on-dark leading-[1.72] flex-1">
            "Reading in short bursts with intentional pauses activates your brain's consolidation process — what you're doing right now."
          </p>
          <div className="font-display text-[10.5px] text-accent-gold mt-3 mb-5">— On spaced learning</div>
          <div className="h-px bg-ink-on-dark/10 mb-4" />
          <div className="text-[9px] font-bold tracking-[2px] uppercase text-ink-on-dark/30 mb-3">This session</div>
          {[
            ['Source', progress < 30 ? 'Extracting…' : 'Extracted'],
            ['Output', 'Summary + Flashcards'],
            ['Mode', modeLabel],
          ].map(([k, v], i) => (
            <div
              key={i}
              className={`flex justify-between items-baseline py-1.5 ${i < 2 ? 'border-b border-ink-on-dark/5' : ''}`}
            >
              <span className="text-[11.5px] text-ink-on-dark/35">{k}</span>
              <span className="font-display text-[11.5px] font-semibold text-ink-on-dark">{v}</span>
            </div>
          ))}
          <div className="mt-5 flex justify-end">
            <button
              onClick={onReset}
              className="text-[12px] text-muted-ink-on-dark hover:text-ink-on-dark transition-colors duration-150 border border-ink-on-dark/15 px-4 py-1.5 hover:border-ink-on-dark/30"
              title={t('processing.cancel_processing')}
            >
              Cancel processing
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Wrapper component that checks context availability
export const ProcessingStatus: React.FC<ProcessingStatusProps> = (props) => {
  // Check if context is available before rendering
  const i18nContext = useContext(I18nContext);
  
  // If context is not available, don't render (this should never happen in normal flow)
  if (!i18nContext) {
    console.warn('ProcessingStatus: I18nContext not available, skipping render');
    return null;
  }
  
  // Context is available, render the component
  return <ProcessingStatusContent {...props} />;
};