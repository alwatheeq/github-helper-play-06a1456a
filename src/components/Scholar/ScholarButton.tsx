import React from 'react';
import { ScholarSpinner } from './ScholarSpinner';

export type ScholarButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ScholarButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ScholarButtonVariant;
  size?: ScholarButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsAnchor = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ScholarButtonProps = ButtonAsButton | ButtonAsAnchor;

const sizeMap: Record<ScholarButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

const variantMap: Record<ScholarButtonVariant, string> = {
  primary:
    'bg-accent-gold text-ink-on-dark hover:opacity-90 [data-theme="monochrome"]_&:text-ink-on-dark',
  secondary:
    'bg-transparent border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark hover:bg-subtle',
  ghost:
    'bg-transparent text-ink dark:text-ink-on-dark hover:bg-subtle',
  danger:
    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
};

const baseCls =
  'inline-flex items-center justify-center font-medium ' +
  'transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 select-none ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const ScholarButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ScholarButtonProps
>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    children,
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const cls = [
    baseCls,
    sizeMap[size],
    variantMap[variant],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      {loading ? (
        <>
          <ScholarSpinner size={size === 'lg' ? 'md' : 'sm'} />
          <span>{loadingText ?? 'Processing…'}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </>
  );

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
        aria-busy={loading || undefined}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonRest.type ?? 'button'}
      className={cls}
      aria-busy={loading || undefined}
      disabled={(buttonRest.disabled as boolean | undefined) || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

ScholarButton.displayName = 'ScholarButton';

export default ScholarButton;
