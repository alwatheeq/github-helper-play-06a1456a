import React from 'react';

export interface EditorialColumn<T> {
  id: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  /** Tailwind alignment class. RTL-aware via logical utilities is recommended. */
  align?: 'start' | 'center' | 'end';
  width?: string;
  /** Hide on mobile (< sm). */
  hideOnMobile?: boolean;
}

interface EditorialTableProps<T> {
  columns: EditorialColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  empty?: React.ReactNode;
  className?: string;
  caption?: string;
}

const alignMap = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

/**
 * Borderless table with hairline row dividers and tracked uppercase headers.
 * No card wrapper — caller wraps in EditorialCard if needed.
 */
export function EditorialTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  className = '',
  caption,
}: EditorialTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <div className={`py-12 text-center text-muted-ink dark:text-muted-ink-on-dark ${className}`}>{empty}</div>;
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-divider dark:border-divider-on-dark">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={[
                  'py-3 px-3 text-[11px] font-semibold tracking-[0.14em] uppercase',
                  'text-muted-ink dark:text-muted-ink-on-dark',
                  alignMap[col.align ?? 'start'],
                  col.hideOnMobile ? 'hidden sm:table-cell' : '',
                ].join(' ')}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
              className={[
                'border-b border-divider/60 dark:border-divider-on-dark/60 last:border-b-0',
                onRowClick ? 'cursor-pointer hover:bg-subtle' : '',
                'transition-colors',
              ].join(' ')}
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={[
                    'py-4 px-3 text-sm text-ink dark:text-ink-on-dark align-middle',
                    alignMap[col.align ?? 'start'],
                    col.hideOnMobile ? 'hidden sm:table-cell' : '',
                  ].join(' ')}
                >
                  {col.render(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EditorialTable;
