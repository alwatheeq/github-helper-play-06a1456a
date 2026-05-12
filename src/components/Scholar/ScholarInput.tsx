import React from 'react';

const fieldBase =
  'w-full bg-card-light dark:bg-card-dark ' +
  'border border-divider dark:border-divider-on-dark ' +
  'rounded-[6px] px-3 py-2 text-sm ' +
  'text-ink dark:text-ink-on-dark ' +
  'placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark ' +
  'transition-colors duration-[var(--s4-dur-fast)] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-accent-gold/60 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const errorCls = 'border-red-500 dark:border-red-500 focus-visible:ring-red-500/30 focus:border-red-500';

interface FieldShellProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

const FieldShell: React.FC<FieldShellProps> = ({ label, helperText, errorText, htmlFor, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={htmlFor} className="eyebrow text-secondary-ink dark:text-muted-ink-on-dark">
        {label}
      </label>
    )}
    {children}
    {errorText ? (
      <span className="text-xs text-red-600 dark:text-red-400">{errorText}</span>
    ) : helperText ? (
      <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{helperText}</span>
    ) : null}
  </div>
);

interface ScholarInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  error?: boolean;
}

export const ScholarInput = React.forwardRef<HTMLInputElement, ScholarInputProps>(
  ({ label, helperText, errorText, error, className = '', id, ...rest }, ref) => {
    const isError = error || !!errorText;
    return (
      <FieldShell label={label} helperText={helperText} errorText={errorText} htmlFor={id}>
        <input
          ref={ref}
          id={id}
          className={`${fieldBase} ${isError ? errorCls : ''} ${className}`}
          {...rest}
        />
      </FieldShell>
    );
  }
);
ScholarInput.displayName = 'ScholarInput';

interface ScholarTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  error?: boolean;
}

export const ScholarTextarea = React.forwardRef<HTMLTextAreaElement, ScholarTextareaProps>(
  ({ label, helperText, errorText, error, className = '', id, ...rest }, ref) => {
    const isError = error || !!errorText;
    return (
      <FieldShell label={label} helperText={helperText} errorText={errorText} htmlFor={id}>
        <textarea
          ref={ref}
          id={id}
          className={`${fieldBase} resize-y min-h-[80px] ${isError ? errorCls : ''} ${className}`}
          {...rest}
        />
      </FieldShell>
    );
  }
);
ScholarTextarea.displayName = 'ScholarTextarea';

interface ScholarSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  error?: boolean;
  children?: React.ReactNode;
}

export const ScholarSelect = React.forwardRef<HTMLSelectElement, ScholarSelectProps>(
  ({ label, helperText, errorText, error, className = '', id, children, ...rest }, ref) => {
    const isError = error || !!errorText;
    return (
      <FieldShell label={label} helperText={helperText} errorText={errorText} htmlFor={id}>
        <select
          ref={ref}
          id={id}
          className={`${fieldBase} ${isError ? errorCls : ''} ${className}`}
          {...rest}
        >
          {children}
        </select>
      </FieldShell>
    );
  }
);
ScholarSelect.displayName = 'ScholarSelect';
