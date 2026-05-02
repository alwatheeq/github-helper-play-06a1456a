import React from 'react';

export interface RomanListItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

interface RomanListProps {
  items: RomanListItem[];
  /** Starting index (default 1 → "i."). */
  start?: number;
  className?: string;
  empty?: React.ReactNode;
}

const toRoman = (num: number): string => {
  // Lowercase roman numerals. Sufficient up to 3999.
  const map: Array<[number, string]> = [
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
  ];
  let n = num;
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out || 'i';
};

/**
 * Editorial ranked list with lowercase Roman-numeral markers (i. ii. iii.).
 * Hairline dividers between rows. No italics anywhere — markers are upright.
 */
export const RomanList: React.FC<RomanListProps> = ({
  items,
  start = 1,
  className = '',
  empty,
}) => {
  if (items.length === 0 && empty) {
    return (
      <div className={`py-6 text-center text-sm text-muted-ink dark:text-muted-ink-on-dark ${className}`}>
        {empty}
      </div>
    );
  }

  return (
    <ol className={`w-full divide-y divide-divider dark:divide-divider-on-dark ${className}`}>
      {items.map((item, idx) => (
        <li
          key={item.id}
          className={`py-3 flex items-baseline gap-3 ${
            item.onClick
              ? 'cursor-pointer hover:bg-subtle px-2 -mx-2 rounded-[6px] transition-colors'
              : ''
          }`}
          onClick={item.onClick}
        >
          <span className="font-display text-sm font-medium text-accent-gold w-8 flex-shrink-0 tabular-nums tracking-wide">
            {toRoman(start + idx)}.
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-ink dark:text-ink-on-dark truncate">
              {item.title}
            </div>
            {item.meta ? (
              <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-ink dark:text-muted-ink-on-dark truncate">
                {item.meta}
              </div>
            ) : null}
          </div>
          {item.action ? <div className="flex-shrink-0">{item.action}</div> : null}
        </li>
      ))}
    </ol>
  );
};

export default RomanList;
