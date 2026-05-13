import React from 'react';

interface ScholarSkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  count?: number;
  className?: string;
  gap?: number;
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-[4px]',
  md: 'rounded-[6px]',
  lg: 'rounded-[12px]',
  full: 'rounded-full',
};

export const ScholarSkeleton: React.FC<ScholarSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  count = 1,
  className = '',
  gap = 8,
}) => {
  const items = Array.from({ length: count });
  return (
    <div className="flex flex-col" style={{ gap }} aria-hidden="true">
      {items.map((_, i) => (
        <div
          key={i}
          className={`parchment-shimmer ${roundedMap[rounded]} ${className}`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
          }}
        />
      ))}
    </div>
  );
};

export default ScholarSkeleton;
