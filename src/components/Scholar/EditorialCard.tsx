import React from 'react';

export type EditorialCardVariant = 'default' | 'accent';
export type EditorialCardPadding = 'none' | 'sm' | 'md' | 'lg';

interface EditorialCardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: EditorialCardVariant;
  padding?: EditorialCardPadding;
  /** Subtle hover affordance: border deepens (no shadow lift). */
  hover?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside';
  children?: React.ReactNode;
}

const paddingMap: Record<EditorialCardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Hairline-bordered editorial card. No drop shadow.
 * Variant `accent` flips surface: dark in light pages, light in dark pages.
 */
export const EditorialCard: React.FC<EditorialCardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  as = 'div',
  className = '',
  children,
  ...rest
}) => {
  const Tag = as as keyof JSX.IntrinsicElements;

  const surface =
    variant === 'accent'
      ? 'bg-sidebar text-ink-on-dark dark:bg-card-light dark:text-ink border-divider-on-dark dark:border-divider'
      : 'bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark border-divider dark:border-divider-on-dark';

  const hoverCls = hover
    ? 'transition-colors hover:border-ink/40 dark:hover:border-ink-on-dark/40'
    : '';

  const cls = [
    'border rounded-[6px]',
    surface,
    paddingMap[padding],
    hoverCls,
    className,
  ].join(' ');

  return React.createElement(Tag, { className: cls, ...rest }, children);
};

export default EditorialCard;
