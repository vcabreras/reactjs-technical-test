import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface SkeletonProps {
  /** Ancho en columnas de Bootstrap (`col-*`). */
  width?: ColSpan;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/** Barra de placeholder de Bootstrap. Puramente visual: usar dentro de `SkeletonGroup`. */
export function Skeleton({ width = 12, size = 'md', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'placeholder',
        `col-${width}`,
        size !== 'md' && `placeholder-${size}`,
        className,
      )}
    />
  );
}

export interface SkeletonGroupProps {
  /** Texto que se anuncia a lectores de pantalla mientras se carga. */
  label?: string;
  className?: string;
  children: ReactNode;
}

/** Contenedor de skeletons: animación `placeholder-glow` + anuncio accesible de carga. */
export function SkeletonGroup({ label = 'Cargando…', className, children }: SkeletonGroupProps) {
  return (
    <div role="status" className={cx('placeholder-glow', className)}>
      <span className="visually-hidden">{label}</span>
      {children}
    </div>
  );
}
