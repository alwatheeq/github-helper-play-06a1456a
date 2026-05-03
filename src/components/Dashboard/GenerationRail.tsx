import React from 'react';
import { FileText, Layers, ClipboardList, Network } from 'lucide-react';

interface ToggleProps {
  on: boolean;
  disabled?: boolean;
  onToggle?: (next: boolean) => void;
  label: string;
}

const Toggle: React.FC<ToggleProps> = ({ on, disabled, onToggle, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={disabled}
    onClick={() => onToggle?.(!on)}
    className={`relative h-4 w-[30px] rounded-full transition-colors duration-200 flex-shrink-0 ${
      on ? 'bg-accent-gold' : 'bg-divider-on-dark'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute top-0.5 h-3 w-3 rounded-full bg-card-light transition-transform duration-200 ${
        on ? 'translate-x-[15px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

interface RowProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  on: boolean;
  onToggle: (next: boolean) => void;
  isLast?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, name, description, on, onToggle, isLast }) => (
  <div
    className={`flex items-center justify-between py-2.5 ${
      isLast ? '' : 'border-b border-divider-on-dark'
    }`}
  >
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="text-muted-ink-on-dark mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-on-dark leading-tight">{name}</p>
        <p className="text-[11px] font-light text-muted-ink-on-dark mt-0.5 leading-tight">
          {description}
        </p>
      </div>
    </div>
    <Toggle on={on} onToggle={onToggle} label={name} />
  </div>
);

interface GenerationRailProps {
  includeSummary: boolean;
  includeFlashcards: boolean;
  onToggleSummary?: (next: boolean) => void;
  onToggleFlashcards?: (next: boolean) => void;
}

/**
 * The single dark feature card on the Dashboard. 300px column, 22px padding.
 * Examination & Mind map are visual-only (TODO: connect).
 */
export const GenerationRail: React.FC<GenerationRailProps> = ({
  includeSummary,
  includeFlashcards,
  onToggleSummary,
  onToggleFlashcards,
}) => {
  // TODO: connect — Examination & Mind map outputs not implemented yet
  const [exam, setExam] = React.useState(false);
  const [mindMap, setMindMap] = React.useState(false);

  // TODO: connect cost estimator
  const cost = 8;

  return (
    <section
      className="bg-card-dark text-ink-on-dark rounded-[6px]"
      style={{ padding: '22px' }}
    >
      <div className="text-[10px] font-bold tracking-[2px] uppercase text-accent-gold mb-1">
        What to generate
      </div>
      <h3 className="font-display text-[22px] font-semibold text-ink-on-dark mb-4 leading-tight">
        Outputs.
      </h3>
      <hr className="border-divider-on-dark mb-3" />

      <div>
        <Row
          icon={<FileText size={14} strokeWidth={1.5} />}
          name="Summary"
          description="Concise notes from the source"
          on={includeSummary}
          onToggle={(v) => onToggleSummary?.(v)}
        />
        <Row
          icon={<Layers size={14} strokeWidth={1.5} />}
          name="Flashcards"
          description="For spaced review"
          on={includeFlashcards}
          onToggle={(v) => onToggleFlashcards?.(v)}
        />
        <Row
          icon={<ClipboardList size={14} strokeWidth={1.5} />}
          name="Examination"
          description="Quiz from the content"
          on={exam}
          onToggle={setExam}
        />
        <Row
          icon={<Network size={14} strokeWidth={1.5} />}
          name="Mind map"
          description="Visual outline"
          on={mindMap}
          onToggle={setMindMap}
          isLast
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[1.5px] text-muted-ink-on-dark">
          Cost
        </span>
        <span className="text-[13px] font-semibold text-accent-gold">{cost} credits</span>
      </div>

      <button
        type="button"
        disabled
        title="Use the form on the left to generate"
        className="mt-3 w-full bg-accent-gold text-card-dark text-[13px] font-bold rounded-[4px] py-3 disabled:opacity-90 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Generate <span aria-hidden>→</span>
      </button>
    </section>
  );
};

export default GenerationRail;
