import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';

export type SpinnerSize = 'sm' | 'md';

export interface SpinnerProps extends Omit<ComponentProps<'span'>, 'children'> {
  size?: SpinnerSize;
  /** Texto para lectores de pantalla. Se ignora si `decorative`. */
  label?: string;
  /**
   * Solo visual (`aria-hidden`), para cuando el contexto ya comunica la carga
   * (p. ej. un `Button` con `aria-busy`).
   */
  decorative?: boolean;
}

export function Spinner({
  size = 'md',
  label = 'Cargando…',
  decorative = false,
  className,
  ...props
}: SpinnerProps) {
  const classes = cx('spinner-border', size === 'sm' && 'spinner-border-sm', className);

  if (decorative) {
    return <span className={classes} aria-hidden="true" {...props} />;
  }

  return (
    <span role="status" className={classes} {...props}>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
