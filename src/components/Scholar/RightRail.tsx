import React from 'react';

interface RightRailProps {
  children: React.ReactNode;
  className?: string;
  /** Sticky-position the rail under the page header on large screens. */
  sticky?: boolean;
}

/**
 * Fixed-width right column for accent cards next to main content.
 * Stacks below main content on screens narrower than `lg`.
 */
export const RightRail: React.FC<RightRailProps> = ({
  children,
  className = '',
  sticky = false,
}) => {
  const cls = [
    'w-full lg:w-[340px] lg:flex-shrink-0 space-y-6',
    sticky ? 'lg:sticky lg:top-24 lg:self-start' : '',
    className,
  ].join(' ');
  return <aside className={cls}>{children}</aside>;
};

export default RightRail;
