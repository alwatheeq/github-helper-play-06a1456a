import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Layers, ClipboardList, Network } from 'lucide-react';
import { InputForm } from './InputForm';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { todo } from '../../utils/todoToast';
import type { AcademicsGenerationPreferences } from '../../utils/academicsGenerationPreferences';

/**
 * WorkshopV4 — Phase 5.1 rebuild.
 * Mirrors design/templates/Scholar-v4.jsx → Dash4 (lines 152–278):
 *   • 1.4fr / 1fr two-column grid at lg+, stacks below
 *   • Left: dropzone (delegates to <InputForm/>) + roman-numeral recent list
 *   • Right: dark "What to generate" panel + light tip card
 *
 * Pure presentation. Wiring is preserved 1:1 with the previous WorkshopPanel:
 *   onProcessInput → InputForm CTAs (file, text, scan, URL)
 *   recents       → user_history (read-only, 5 latest)
 *   toggles       → visual-only state (parity with GenerationRail v1)
 */

interface WorkshopV4Props {
  onProcessInput: (
    input: File | string,
    flashcardCount: number,
    fromSummary: boolean,
    medicalMode?: boolean,
    useOCR?: boolean,
    generationPrefs?: AcademicsGenerationPreferences
  ) => void;
  onOpenHistory?: () => void;
}

/** Stepper button for the question count control in the dark "What to Generate" panel. */
const StepBtn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-7 h-7 bg-transparent border border-accent-gold/35 text-accent-gold text-lg font-light cursor-pointer grid place-items-center leading-none hover:border-accent-gold/60 transition-colors duration-[var(--s4-dur-fast)]"
  >
    {children}
  </button>
);

interface HistoryRow {
  id: string;
  original_file_name: string | null;
  summary_text: string | null;
  flashcards_json: Array<{ front: string; back: string }> | null;
  created_at: string;
}

const ROMAN = ['i.', 'ii.', 'iii.', 'iv.', 'v.'];

const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const deriveOutputType = (row: HistoryRow): string => {
  const cards = row.flashcards_json?.length ?? 0;
  const hasSummary = !!row.summary_text?.trim();
  if (cards > 0 && hasSummary) return `summary written · ${cards} cards`;
  if (cards > 0) return `${cards} cards drawn`;
  if (hasSummary) return 'summary written';
  return 'processed';
};

interface RowToggleProps {
  on: boolean;
  onToggle: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}
const RowToggle: React.FC<RowToggleProps> = ({ on, onToggle, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={disabled}
    onClick={() => onToggle(!on)}
    className={`relative h-[18px] w-[34px] rounded-full transition-[background-color] duration-[var(--s4-dur-fast)] ease-[var(--s4-ease-out)] flex-shrink-0 ${
      on ? 'bg-accent-gold' : 'bg-accent-gold/20'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute top-[3px] h-3 w-3 rounded-full bg-card-dark transition-[left] duration-[var(--s4-dur-fast)] ease-[var(--s4-ease-out)] ${
        on ? 'left-[19px]' : 'left-[3px]'
      }`}
    />
  </button>
);

interface GenRowProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  on: boolean;
  onToggle: (next: boolean) => void;
  isLast?: boolean;
}
const GenRow: React.FC<GenRowProps> = ({ icon, name, description, on, onToggle, isLast }) => (
  <div
    className={`flex items-center justify-between py-2.5 ${
      isLast ? '' : 'border-b border-accent-gold/20'
    }`}
  >
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="text-muted-ink-on-dark mt-0.5 flex-shrink-0" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-on-dark leading-tight">{name}</p>
        <p className="text-[11px] font-light text-accent-gold mt-0.5 leading-tight">
          {description}
        </p>
      </div>
    </div>
    <RowToggle on={on} onToggle={onToggle} label={name} />
  </div>
);

export const WorkshopV4: React.FC<WorkshopV4Props> = ({ onProcessInput, onOpenHistory }) => {
  const { t } = useI18n();
  const { user } = useAuth();

  // Visual-only generation toggles (parity with GenerationRail v1).
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeFlashcards, setIncludeFlashcards] = useState(true);
  const [includeExam, setIncludeExam] = useState(false);
  const [includeMindMap, setIncludeMindMap] = useState(false);

  // Question count stepper — examination count, visual-only (Dash4 spec).
  const [qCount, setQCount] = useState(10);

  // Recent rows (5 latest).
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    supabase
      .from('user_history')
      .select('id, original_file_name, summary_text, flashcards_json, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(5)
      .then(({ data }) => {
        if (alive) setRows((data as HistoryRow[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  // Rotating tip — v4 copy + 4500ms cadence, honors prefers-reduced-motion.
  const tips = useMemo(
    () => [
      t('workshop.tip_1'),
      t('workshop.tip_2'),
      t('workshop.tip_3'),
    ],
    [t]
  );
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % tips.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [tips.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[22px]">
      {/* ── Left column ──────────────────────────────────────── */}
      <div className="min-w-0 space-y-[18px]">
        {/* Dropzone — delegated to existing InputForm (file / text / scan / url) */}
        <InputForm onProcessInput={onProcessInput} />

        {/* Recently processed — roman-numeral list */}
        <section aria-labelledby="recently-processed-title">
          <div
            id="recently-processed-title"
            className="text-[10px] font-bold tracking-[2px] uppercase text-muted-ink mb-2"
          >
            {t('workshop.recent_eyebrow')}
          </div>

          {rows === null ? (
            <ul aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-3 py-2.5 border-b border-divider animate-pulse"
                >
                  <span className="h-3 w-5 bg-subtle rounded" />
                  <span className="flex-1 h-3 bg-subtle rounded" />
                </li>
              ))}
            </ul>
          ) : rows.length === 0 ? (
            <p className="text-[13px] text-muted-ink font-light py-2.5">
              {t('workshop.recent_empty')}
            </p>
          ) : (
            <ul>
              {rows.map((row, idx) => (
                <li
                  key={row.id}
                  className={`flex items-baseline gap-3 py-2.5 ${
                    idx === rows.length - 1 ? '' : 'border-b border-divider'
                  }`}
                >
                  <span className="font-display text-[12px] text-accent-gold w-[22px] tabular-nums">
                    {ROMAN[idx] ?? `${idx + 1}.`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">
                      {row.original_file_name?.trim() || t('workshop.untitled')}
                    </div>
                    <div className="font-display text-[11.5px] text-muted-ink mt-0.5">
                      {deriveOutputType(row)} · {formatRelative(row.created_at)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenHistory}
                    className="text-[12px] font-medium text-secondary-ink border border-divider px-2.5 py-1 rounded-[var(--s4-radius-btn)] hover:bg-subtle/60 transition-[background-color] duration-[var(--s4-dur-fast)] ease-[var(--s4-ease-out)]"
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Right column ─────────────────────────────────────── */}
      <div className="min-w-0 space-y-[14px]">
        {/* Dark "What to generate" panel */}
        <section
          className="bg-card-dark text-ink-on-dark rounded-[var(--s4-radius-card)]"
          style={{ padding: 'var(--s4-card-pad-dark)' }}
        >
          <div className="text-[10px] font-bold tracking-[2px] uppercase text-accent-gold">
            {t('workshop.outputs_eyebrow')}
          </div>

          <div className="mt-3.5">
            <GenRow
              icon={<FileText size={14} strokeWidth={1.5} />}
              name="Summary"
              description={t('workshop.row_summary_desc')}
              on={includeSummary}
              onToggle={setIncludeSummary}
            />
            <GenRow
              icon={<Layers size={14} strokeWidth={1.5} />}
              name="Flashcards"
              description={t('workshop.row_flashcards_desc')}
              on={includeFlashcards}
              onToggle={setIncludeFlashcards}
            />
            <GenRow
              icon={<ClipboardList size={14} strokeWidth={1.5} />}
              name={t('workshop.row_examination')}
              description={t('workshop.row_examination_desc')}
              on={includeExam}
              onToggle={(v) => {
                setIncludeExam(v);
                if (v) todo(t('workshop.row_examination'));
              }}
            />
            <GenRow
              icon={<Network size={14} strokeWidth={1.5} />}
              name={t('workshop.row_mindmap')}
              description={t('workshop.row_mindmap_desc')}
              on={includeMindMap}
              onToggle={(v) => {
                setIncludeMindMap(v);
                if (v) todo(t('workshop.row_mindmap'));
              }}
              isLast
            />
          </div>

          {/* Question count stepper — Dash4 spec */}
          <div className="flex items-center justify-between py-2.5 border-t border-accent-gold/20 mt-0.5">
            <div>
              <div className="text-[10px] font-bold tracking-[1.5px] uppercase text-accent-gold">
                {t('workshop.questions_label') || 'Questions'}
              </div>
              <div className="font-display text-[10.5px] text-ink-on-dark/45 mt-0.5">
                {t('workshop.per_examination') || 'per examination'}
              </div>
            </div>
            <div className="flex items-stretch">
              <StepBtn onClick={() => setQCount((c) => Math.max(5, c - 5))}>−</StepBtn>
              <div className="w-[38px] h-7 border-t border-b border-accent-gold/35 grid place-items-center font-display text-[14px] text-ink-on-dark tabular-nums">
                {qCount}
              </div>
              <StepBtn onClick={() => setQCount((c) => Math.min(50, c + 5))}>+</StepBtn>
            </div>
          </div>

          <div className="pt-3.5 border-t border-accent-gold/25">
            <div className="text-[11px] text-accent-gold mb-2.5 tabular-nums">
              8 {t('workshop.credits')}
            </div>
            <button
              type="button"
              disabled
              title={t('workshop.generate_disabled_hint')}
              className="w-full bg-accent-gold text-card-dark text-[13px] font-semibold py-2.5 disabled:opacity-90 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-[opacity] duration-[var(--s4-dur-fast)] ease-[var(--s4-ease-out)]"
            >
              <span>{t('workshop.generate_cta')}</span>
              <ArrowRight size={14} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </section>

        {/* Tip card — light panel, font-display italic rotating tip (Dash4 spec) */}
        <section className="bg-card-light border border-divider px-[18px] py-4 min-h-[76px]">
          <div className="text-[9px] font-bold tracking-[2px] uppercase text-muted-ink mb-2 tabular-nums">
            {String(tipIdx + 1).padStart(2, '0')} / {String(tips.length).padStart(2, '0')}
          </div>
          <p
            className="font-display text-[13px] text-ink leading-[1.6] italic transition-[opacity] duration-[var(--s4-dur-base)] ease-[var(--s4-ease)]"
            aria-live="polite"
          >
            {tips[tipIdx]}
          </p>
        </section>
      </div>
    </div>
  );
};

export default WorkshopV4;
