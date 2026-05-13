import React from 'react';

interface MasteryBarProps {
  topic: React.ReactNode;
  courseCode?: React.ReactNode;
  /** Percentage 0–100. */
  percent: number;
  className?: string;
}

/**
 * Single-line mastery row: topic + course code (left), percent + thin progress (right).
 */
export const MasteryBar: React.FC<MasteryBarProps> = ({
  topic,
  courseCode,
  percent,
  className = '',
}) => {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-sm text-ink dark:text-ink-on-dark truncate">{topic}</span>
          {courseCode ? (
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-accent-gold flex-shrink-0">
              {courseCode}
            </span>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-ink dark:text-ink-on-dark flex-shrink-0">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="mt-1.5 relative w-full h-1 bg-chip rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 start-0 bg-accent-gold rounded-full transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default MasteryBar;
