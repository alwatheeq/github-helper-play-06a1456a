import React from 'react';
import { EditorialCard, EditorialCardPadding, EditorialCardVariant } from '../Scholar/EditorialCard';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  /** 'default' (light surface) or 'accent' (inverted surface for callout cards). */
  variant?: 'default' | 'accent';
}

/**
 * Project-wide card. Thin wrapper over EditorialCard so legacy call sites
 * keep working while new code can opt into the `accent` variant.
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  variant = 'default',
}) => (
  <EditorialCard
    variant={variant as EditorialCardVariant}
    padding={padding as EditorialCardPadding}
    hover={hover}
    className={className}
  >
    {children}
  </EditorialCard>
);

export default Card;
