import React from 'react';

interface WorkshopHeaderProps {
  /** Small gold uppercase label above the heading. */
  eyebrow: string;
  /** Serif H1 — the editorial page title. */
  title: string;
}

/**
 * Scholar v4 page header block: gold eyebrow + serif H1 + hairline rule.
 * Reusable across every page rebuilt in Phase 3 so the pattern stays consistent.
 */
export const WorkshopHeader: React.FC<WorkshopHeaderProps> = ({ eyebrow, title }) => (
  <header className="mb-8">
    <div className="text-[11px] font-bold tracking-[2px] uppercase text-accent-gold">
      {eyebrow}
    </div>
    <h1
      className="font-display font-semibold text-ink dark:text-ink-on-dark mt-1 leading-[1.1] tracking-[-0.02em]"
      style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}
    >
      {title}
    </h1>
    <hr
      className="border-divider dark:border-divider-on-dark mt-4"
      style={{ borderRadius: 'var(--s4-radius-card)' }}
    />
  </header>
);

export default WorkshopHeader;
