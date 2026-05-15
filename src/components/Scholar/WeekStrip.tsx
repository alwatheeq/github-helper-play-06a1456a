import React from 'react';

export interface WeekStripDay {
  date: Date;
  /** Optional event count or marker for the day. */
  count?: number;
}

interface WeekStripProps {
  days: WeekStripDay[];
  selectedDate: Date;
  todayDate?: Date;
  onSelect: (date: Date) => void;
  onPrev?: () => void;
  onToday?: () => void;
  onNext?: () => void;
  /** Day-of-week label formatter, e.g. (d) => d.toLocaleDateString(locale, { weekday: 'short' }). */
  formatDow?: (d: Date) => string;
  /** Day-of-month label formatter. */
  formatDom?: (d: Date) => string;
  prevLabel?: string;
  todayLabel?: string;
  nextLabel?: string;
  className?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Seven-day strip with prev/today/next ghost controls.
 * Today gets the gold border; selected day gets the dark surface fill.
 */
export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  selectedDate,
  todayDate = new Date(),
  onSelect,
  onPrev,
  onToday,
  onNext,
  formatDow = (d) => d.toLocaleDateString(undefined, { weekday: 'short' }),
  formatDom = (d) => String(d.getDate()),
  prevLabel = 'Prev',
  todayLabel = 'Today',
  nextLabel = 'Next',
  className = '',
}) => {
  const ghost =
    'px-3 py-1 text-xs font-medium border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle transition-colors';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-end gap-2 mb-3">
        {onPrev ? <button type="button" onClick={onPrev} className={ghost}>{prevLabel}</button> : null}
        {onToday ? <button type="button" onClick={onToday} className={ghost}>{todayLabel}</button> : null}
        {onNext ? <button type="button" onClick={onNext} className={ghost}>{nextLabel}</button> : null}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isToday = sameDay(d.date, todayDate);
          const isSelected = sameDay(d.date, selectedDate);
          return (
            <button
              key={d.date.toISOString()}
              type="button"
              onClick={() => onSelect(d.date)}
              aria-pressed={isSelected}
              className={[
                'flex flex-col items-center justify-center py-3 border transition-colors text-center',
                isSelected
                  ? 'bg-ink text-ink-on-dark border-ink dark:bg-card-light dark:text-ink dark:border-card-light'
                  : isToday
                  ? 'border-accent-gold text-ink dark:text-ink-on-dark bg-card-light dark:bg-card-dark'
                  : 'border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark hover:border-ink/40 dark:hover:border-ink-on-dark/40',
              ].join(' ')}
            >
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase opacity-80">
                {formatDow(d.date)}
              </span>
              <span className="font-display text-xl mt-0.5">{formatDom(d.date)}</span>
              {typeof d.count === 'number' && d.count > 0 ? (
                <span className="mt-1 text-[10px] opacity-70">{d.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
