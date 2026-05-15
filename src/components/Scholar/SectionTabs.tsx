import React from 'react';

export interface SectionTab {
  id: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface SectionTabsProps {
  tabs: SectionTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  /** Render as a segmented control (equal-width pill-less buttons) instead of underline. */
  segmented?: boolean;
  ariaLabel?: string;
}

/**
 * Text tabs with a gold underline on the active tab.
 * No background pills, no italics. Keyboard-navigable (arrow keys).
 */
export const SectionTabs: React.FC<SectionTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  segmented = false,
  ariaLabel,
}) => {
  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    let next = idx;
    for (let i = 0; i < tabs.length; i++) {
      next = (next + dir + tabs.length) % tabs.length;
      if (!tabs[next].disabled) break;
    }
    onChange(tabs[next].id);
  };

  if (segmented) {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`inline-flex border border-divider dark:border-divider-on-dark overflow-hidden ${className}`}
      >
        {tabs.map((tab, idx) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onKeyDown={(e) => handleKey(e, idx)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-ink text-ink-on-dark dark:bg-card-light dark:text-ink'
                  : 'bg-transparent text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle',
                tab.disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="ms-2 text-muted-ink dark:text-muted-ink-on-dark">
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-end gap-6 border-b border-divider dark:border-divider-on-dark overflow-x-auto ${className}`}
    >
      {tabs.map((tab, idx) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={[
              'relative pb-[6px] pt-[2px] font-display text-[13.5px] whitespace-nowrap transition-colors -mb-px',
              active
                ? 'text-ink dark:text-ink-on-dark font-semibold'
                : 'text-muted-ink dark:text-muted-ink-on-dark font-medium hover:text-ink dark:hover:text-ink-on-dark',
              tab.disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <span className="inline-flex items-center gap-2">
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                  {tab.count}
                </span>
              ) : null}
            </span>
            {active ? (
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent-gold" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
