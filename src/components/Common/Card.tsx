import React from 'react';
import { ScholarCard, ScholarCardPadding } from '../Scholar';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => (
  <ScholarCard padding={padding as ScholarCardPadding} hover={hover} className={className}>
    {children}
  </ScholarCard>
);

export default Card;
