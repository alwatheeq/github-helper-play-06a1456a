import React from 'react';
import { Loader2 } from 'lucide-react';

export type ScholarSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface ScholarSpinnerProps {
  size?: ScholarSpinnerSize;
  label?: string;
  className?: string;
}

const sizeMap: Record<ScholarSpinnerSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-10 w-10',
};

export const ScholarSpinner: React.FC<ScholarSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center ${className}`} role="status" aria-live="polite">
      <Loader2 className={`${sizeMap[size]} animate-spin text-accent-gold`} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
};

export default ScholarSpinner;
