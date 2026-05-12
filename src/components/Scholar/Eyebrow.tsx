import React from 'react';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/**
 * Small uppercase tracked gold label used above section titles.
 * No italics, no decoration — just tone-setting metadata.
 */
export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  className = '',
  as = 'span',
}) => {
  const Tag = as as keyof JSX.IntrinsicElements;
  const cls = [
    'inline-block',
    'text-[10px] font-bold tracking-[0.25em] uppercase',
    'text-accent-gold',
    className,
  ].join(' ');
  return React.createElement(Tag, { className: cls }, children);
};

export default Eyebrow;
