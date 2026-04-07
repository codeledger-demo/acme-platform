import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
  outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button(props: ButtonProps): JSX.Element {
  const {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    isLoading = false,
    type = 'button',
    className = '',
    onClick,
  } = props;

  const classes = [
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
