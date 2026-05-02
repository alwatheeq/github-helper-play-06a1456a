import React from 'react';
import { Eyebrow } from './Eyebrow';

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Append a trailing period to the title (editorial style). Default: true. */
  period?: boolean;
  descriptor?: React.ReactNode;
  /** Right-side action slot (buttons, segmented controls, etc.). */
  actions?: React.ReactNode;
  /** Hide the bottom hairline (useful when followed by a tab strip). Default: false. */
  hideRule?: boolean;
  className?: string;
}

/**
 * Editorial page header: eyebrow → serif title → descriptor → hairline.
 * Sentence case, no italics. RTL-aware via flex defaults.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  period = true,
  descriptor,
  actions,
  hideRule = false,
  className = '',
}) => {
  const titleNode =
    typeof title === 'string' && period && !title.trim().endsWith('.')
      ? `${title}.`
      : title;

  return (
    <header className={`w-full ${className}`}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <div className="mb-2">
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
          ) : null}
          <h1 className="font-display text-3xl sm:text-4xl leading-tight text-ink dark:text-ink-on-dark">
            {titleNode}
          </h1>
          {descriptor ? (
            <p className="mt-2 text-sm sm:text-base text-secondary-ink dark:text-muted-ink-on-dark max-w-2xl">
              {descriptor}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        ) : null}
      </div>
      {!hideRule ? (
        <hr className="hairline border-divider dark:border-divider-on-dark mt-6" />
      ) : null}
    </header>
  );
};

export default PageHeader;
