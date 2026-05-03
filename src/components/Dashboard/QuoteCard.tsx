import React from 'react';

/**
 * Light hairline-bordered card with a rotating tip / quote.
 * TODO: connect to CMS / rotation source.
 */
export const QuoteCard: React.FC = () => {
  return (
    <section className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[6px] p-6">
      <p className="font-display text-base leading-relaxed text-ink dark:text-ink-on-dark">
        “The shortest pencil is longer than the longest memory.”
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-ink dark:text-muted-ink-on-dark">
        — a tip from MeshFahem
      </p>
    </section>
  );
};

export default QuoteCard;
