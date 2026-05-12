import React from 'react';
import type { LucideProps } from 'lucide-react';

interface ScholarIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  icon: React.ComponentType<LucideProps>;
  size?: number;
  strokeWidth?: number;
}

/**
 * Scholar v4 icon wrapper.
 *
 * Enforces the v4 stroke-width spec (1.7 at ≤16px, 1.6 at >16px) and sets
 * `aria-hidden` automatically when no `aria-label` is provided.
 *
 * Existing lucide-react usages are normalized via CSS in `scholarV4.css`
 * (svg.lucide stroke-width override). Use this wrapper for *new* code so
 * that intentional `strokeWidth` overrides remain explicit.
 */
export const ScholarIcon = React.forwardRef<SVGSVGElement, ScholarIconProps>(
  ({ icon: Icon, size = 18, strokeWidth, ...rest }, ref) => {
    const stroke = strokeWidth ?? (size <= 16 ? 1.7 : 1.6);
    return (
      <Icon
        ref={ref}
        size={size}
        strokeWidth={stroke}
        aria-hidden={rest['aria-label'] ? undefined : true}
        {...rest}
      />
    );
  }
);

ScholarIcon.displayName = 'ScholarIcon';

export default ScholarIcon;
