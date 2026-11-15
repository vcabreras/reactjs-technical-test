import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export type SplitViewPanel = 'aside' | 'main';

export interface SplitViewProps {
  aside: ReactNode;
  main: ReactNode;
  /**
   * Panel visible por debajo de `lg`. En `lg` y superior se ven ambos en dos columnas.
   * Se resuelve solo con clases de Bootstrap (sin JS de media queries).
   */
  activePanel: SplitViewPanel;
}

/** Maestro-detalle: `aside` (col-lg-5) + `main` (col-lg-7, sticky en escritorio). */
export function SplitView({ aside, main, activePanel }: SplitViewProps) {
  return (
    <div className="row g-4">
      <div className={cx('col-12 col-lg-5', activePanel !== 'aside' && 'd-none d-lg-block')}>
        {aside}
      </div>
      <div className={cx('col-12 col-lg-7', activePanel !== 'main' && 'd-none d-lg-block')}>
        <div className="split-view__main">{main}</div>
      </div>
    </div>
  );
}
