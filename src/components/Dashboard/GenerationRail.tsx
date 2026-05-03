import React from 'react';

interface ToggleRowProps {
  title: string;
  meta: string;
  on: boolean;
  disabled?: boolean;
  onToggle?: (next: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ title, meta, on, disabled, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div className="min-w-0">
      <p className="font-display text-base text-ink-on-dark">{title}</p>
      <p className="text-xs text-muted-ink-on-dark font-light mt-0.5">{meta}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onToggle?.(!on)}
      className={`relative h-6 w-11 rounded-[4px] border transition-colors duration-150 flex-shrink-0 ${
        on
          ? 'bg-accent-gold border-accent-gold'
          : 'bg-transparent border-divider-on-dark'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-[2px] transition-transform duration-150 ${
          on ? 'translate-x-6 bg-sidebar' : 'translate-x-0.5 bg-muted-ink-on-dark'
        }`}
      />
    </button>
  </div>
);

interface GenerationRailProps {
  includeSummary: boolean;
  includeFlashcards: boolean;
  onToggleSummary?: (next: boolean) => void;
  onToggleFlashcards?: (next: boolean) => void;
  /** Placeholder; TODO: connect cost estimator */
  estimatedCredits?: number;
  /** Visual-only Generate button for v1; submit still happens from the workspace form. */
  onGenerate?: () => void;
  generateDisabled?: boolean;
}

/**
 * Right-rail "What to generate" panel. Dark surface, hairline borders.
 * Examination & Mind map toggles are visual-only with TODO: connect.
 */
export const GenerationRail: React.FC<GenerationRailProps> = ({
  includeSummary,
  includeFlashcards,
  onToggleSummary,
  onToggleFlashcards,
  estimatedCredits = 35,
  onGenerate,
  generateDisabled = true,
}) => {
  // TODO: connect — Examination & Mind map outputs not implemented yet
  const [exam, setExam] = React.useState(false);
  const [mindMap, setMindMap] = React.useState(false);

  return (
    <section className="bg-sidebar text-ink-on-dark border border-divider-on-dark rounded-[6px] p-6">
      <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-accent-gold mb-4">
        What to generate
      </div>

      <div className="divide-y divide-divider-on-dark">
        <ToggleRow
          title="Summary"
          meta="concise notes"
          on={includeSummary}
          onToggle={onToggleSummary}
        />
        <ToggleRow
          title="Flashcards"
          meta="for spaced review"
          on={includeFlashcards}
          onToggle={onToggleFlashcards}
        />
        <ToggleRow
          title="Examination"
          meta="twenty questions"
          on={exam}
          onToggle={setExam}
        />
        <ToggleRow
          title="Mind map"
          meta="visual outline"
          on={mindMap}
          onToggle={setMindMap}
        />
      </div>

      <hr className="border-divider-on-dark my-5" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-ink-on-dark font-light">
          {estimatedCredits} credits
        </span>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generateDisabled}
          title={generateDisabled ? 'Use the workspace below to generate' : undefined}
          className="inline-flex items-center gap-2 px-5 py-2 bg-accent-gold text-sidebar rounded-[6px] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Generate <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
};

export default GenerationRail;
