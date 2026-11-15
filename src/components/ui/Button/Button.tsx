import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';
import { Spinner } from '../Spinner/Spinner';

type SolidVariant =
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

export type ButtonVariant = SolidVariant | `outline-${SolidVariant}` | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra un spinner a la izquierda del texto y deshabilita el botón. */
  isLoading?: boolean;
  /** Texto que sustituye al contenido mientras `isLoading` (p. ej. "Publicando…"). */
  loadingText?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        'd-inline-flex align-items-center justify-content-center gap-2',
        className,
      )}
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <Spinner size="sm" decorative />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
