import React from 'react';
import { ScholarButton, ScholarButtonVariant, ScholarButtonSize } from '../Scholar';

interface LoadingButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

const variantMap: Record<NonNullable<LoadingButtonProps['variant']>, ScholarButtonVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'danger',
  success: 'primary',
  warning: 'secondary',
};

const sizeMap: Record<NonNullable<LoadingButtonProps['size']>, ScholarButtonSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon,
}) => {
  const handleClick = async () => {
    if (loading || disabled) return;
    await onClick();
  };

  return (
    <ScholarButton
      type={type}
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      icon={icon}
      className={className}
    >
      {children}
    </ScholarButton>
  );
};

export default LoadingButton;
