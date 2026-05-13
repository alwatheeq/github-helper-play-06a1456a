import React from 'react';
import { FileText, Layers, ClipboardList, Network, ArrowRight } from 'lucide-react';
import { todo } from '../../utils/todoToast';
import { useI18n } from '../../contexts/I18nContext';

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
 * Dark feature card on the Dashboard right rail.
 * 300px column, v4 dark-card padding token, v4 card-radius token.
 * Examination & Mind map outputs are TODO (#19) — toggling them fires a stub toast.
 */
export const GenerationRail: React.FC<GenerationRailProps> = ({
  includeSummary,
  includeFlashcards,
  onToggleSummary,
  onToggleFlashcards,
}) => {
  const { t } = useI18n();

  // TODO #19 — Examination & Mind-map outputs are not wired from this rail yet
  const [exam, setExam] = React.useState(false);
  const [mindMap, setMindMap] = React.useState(false);

  // Static cost estimate — TODO: wire to real estimator if/when implemented
  const cost = 8;

  // Rotating tip: cycles every 6s; honors prefers-reduced-motion (freeze on first tip).
  const tips = React.useMemo(
    () => [
      t('workshop.tip_1'),
      t('workshop.tip_2'),
      t('workshop.tip_3'),
    ],
    [t]
  );
  const [tipIdx, setTipIdx] = React.useState(0);
  React.useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % tips.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [tips.length]);

  return (
    <section
      className="bg-card-dark text-ink-on-dark rounded-[12px]"
      style={{ padding: 'var(--s4-card-pad-dark)' }}
    >
      <div className="text-[10px] font-bold tracking-[2px] uppercase text-accent-gold mb-1">
        {t('workshop.outputs_eyebrow')}
      </div>
      <h3 className="font-display text-[22px] font-semibold text-ink-on-dark mb-4 leading-tight">
        {t('workshop.outputs_title')}
      </h3>
      <hr className="border-divider-on-dark mb-3" />

      <div>
        <Row
          icon={<FileText size={14} strokeWidth={1.5} />}
          name={t('dashboard.include_summary')}
          description={t('workshop.row_summary_desc')}
          on={includeSummary}
          onToggle={(v) => onToggleSummary?.(v)}
        />
        <Row
          icon={<Layers size={14} strokeWidth={1.5} />}
          name={t('dashboard.include_flashcards')}
          description={t('workshop.row_flashcards_desc')}
          on={includeFlashcards}
          onToggle={(v) => onToggleFlashcards?.(v)}
        />
        <Row
          icon={<ClipboardList size={14} strokeWidth={1.5} />}
          name={t('workshop.row_examination')}
          description={t('workshop.row_examination_desc')}
          on={exam}
          onToggle={(v) => {
            setExam(v);
            if (v) todo(t('workshop.row_examination'));
          }}
        />
        <Row
          icon={<Network size={14} strokeWidth={1.5} />}
          name={t('workshop.row_mindmap')}
          description={t('workshop.row_mindmap_desc')}
          on={mindMap}
          onToggle={(v) => {
            setMindMap(v);
            if (v) todo(t('workshop.row_mindmap'));
          }}
          isLast
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[1.5px] text-muted-ink-on-dark">
          {t('workshop.cost')}
        </span>
        <span className="text-[13px] font-semibold text-accent-gold">
          {cost} {t('workshop.credits')}
        </span>
      </div>

      <button
        type="button"
        disabled
        title={t('workshop.generate_disabled_hint')}
        className="mt-3 w-full bg-accent-gold text-card-dark text-[13px] font-bold rounded-[var(--s4-radius-btn)] py-3 disabled:opacity-90 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <span>{t('workshop.generate_cta')}</span>
        <ArrowRight size={14} strokeWidth={2} aria-hidden />
      </button>

      <p
        className="mt-3 text-[11px] font-light text-muted-ink-on-dark leading-snug min-h-[2.4em] transition-opacity duration-200"
        aria-live="polite"
      >
        {tips[tipIdx]}
      </p>
    </section>
  );
};

export default GenerationRail;
