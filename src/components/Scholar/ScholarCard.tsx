import React from 'react';

export type ScholarCardVariant = 'default' | 'elevated' | 'flat';
export type ScholarCardPadding = 'none' | 'sm' | 'md' | 'lg';

interface ScholarCardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ScholarCardVariant;
  padding?: ScholarCardPadding;
  hover?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside';
  children?: React.ReactNode;
}

const paddingMap: Record<ScholarCardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const variantShadow: Record<ScholarCardVariant, string> = {
  default: 'shadow-[var(--scholar-shadow-sm)]',
  elevated: 'shadow-[var(--scholar-shadow-lg)]',
  flat: 'shadow-none',
};

export const ScholarCard: React.FC<ScholarCardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  as = 'div',
  className = '',
  children,
  ...rest
}) => {
  const Tag = as as keyof JSX.IntrinsicElements;
  const hoverCls = hover ? 'hover:shadow-[var(--scholar-shadow-md)] transition-shadow' : '';
  const cls = [
    'bg-card-light dark:bg-card-dark',
    'border border-divider dark:border-divider-on-dark',
    'rounded-[12px]',
    variantShadow[variant],
    paddingMap[padding],
    hoverCls,
    className,
  ].join(' ');
  return React.createElement(Tag, { className: cls, ...rest }, children);
};

export default ScholarCard;
