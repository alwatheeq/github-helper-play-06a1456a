import React from 'react';

interface ScholarDividerProps {
  label?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingMap = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
};

export const ScholarDivider: React.FC<ScholarDividerProps> = ({
  label,
  className = '',
  spacing = 'md',
}) => {
  if (!label) {
    return (
      <hr
        className={`hairline border-divider dark:border-divider-on-dark ${spacingMap[spacing]} ${className}`}
      />
    );
  }
  return (
    <div className={`flex items-center gap-3 ${spacingMap[spacing]} ${className}`}>
      <span className="flex-1 h-px bg-divider dark:bg-divider-on-dark opacity-60" />
      <span className="eyebrow text-muted-ink dark:text-muted-ink-on-dark">{label}</span>
      <span className="flex-1 h-px bg-divider dark:bg-divider-on-dark opacity-60" />
    </div>
  );
};

export default ScholarDivider;
