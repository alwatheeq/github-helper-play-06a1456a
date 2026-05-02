import React from 'react';
import { EditorialCard } from './EditorialCard';

interface CourseCardStat {
  label: string;
  value: React.ReactNode;
}

interface CourseCardProps {
  code: string;
  lecturer?: React.ReactNode;
  title: string;
  grade?: React.ReactNode;
  stats?: CourseCardStat[];
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Academics course card composite.
 * 2px gold accent rule on top, code + lecturer line, large grade letter,
 * title, stat row, optional action.
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  code,
  lecturer,
  title,
  grade,
  stats,
  action,
  onClick,
  className = '',
}) => {
  return (
    <EditorialCard
      hover
      padding="none"
      className={`overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="h-[2px] bg-accent-gold w-full" aria-hidden />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-accent-gold">
              {code}
            </div>
            {lecturer ? (
              <div className="mt-1 text-xs text-muted-ink dark:text-muted-ink-on-dark truncate">
                {lecturer}
              </div>
            ) : null}
          </div>
          {grade ? (
            <div className="font-display text-4xl leading-none text-ink dark:text-ink-on-dark flex-shrink-0">
              {grade}
            </div>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-lg text-ink dark:text-ink-on-dark line-clamp-2">
          {title}
        </h3>

        {stats && stats.length > 0 ? (
          <>
            <hr className="hairline border-divider dark:border-divider-on-dark my-4" />
            <div className="flex items-center justify-between gap-2 text-xs text-secondary-ink dark:text-muted-ink-on-dark">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col min-w-0">
                  <span className="font-semibold text-ink dark:text-ink-on-dark truncate">
                    {s.value}
                  </span>
                  <span className="opacity-80 truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {action ? <div className="mt-4 flex justify-end">{action}</div> : null}
      </div>
    </EditorialCard>
  );
};

export default CourseCard;
