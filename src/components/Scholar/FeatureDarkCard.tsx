import React from 'react';

interface FeatureDarkCardProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Optional bottom action area (e.g., a ScholarButton). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Inverted-surface editorial feature block. Always renders on the dark sidebar
 * surface, in light or dark mode. No shadow, no gradient — just a hairline.
 * Used for hero/CTA blocks that need contrast against page background.
 */
export const FeatureDarkCard: React.FC<FeatureDarkCardProps> = ({
  eyebrow,
  title,
  body,
  action,
  className = '',
}) => {
  return (
    <section
      className={[
        'bg-sidebar text-ink-on-dark',
        'border border-divider-on-dark',
        'p-6',
        className,
      ].join(' ')}
    >
      {eyebrow ? (
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent-gold mb-3">
          {eyebrow}
        </div>
      ) : null}
      <h3 className="font-display text-xl leading-tight text-ink-on-dark">
        {typeof title === 'string' && !title.trim().endsWith('.') ? `${title}.` : title}
      </h3>
      {body ? (
        <p className="mt-3 text-sm text-muted-ink-on-dark leading-relaxed">{body}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
};

export default FeatureDarkCard;
