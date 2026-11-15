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

/**
 * Maestro-detalle: `aside` (col-lg-4) + `main` (col-lg-8). En escritorio ocupa el alto disponible
 * (`.split-view` en theme.css) y cada columna limita su contenido a ese alto.
 */
export function SplitView({ aside, main, activePanel }: SplitViewProps) {
  return (
    <div className="row g-4 split-view">
      <div
        className={cx(
          'col-12 col-lg-4 split-view__col',
          activePanel !== 'aside' && 'd-none d-lg-block',
        )}
      >
        {aside}
      </div>
      <div
        className={cx(
          'col-12 col-lg-8 split-view__col',
          activePanel !== 'main' && 'd-none d-lg-block',
        )}
      >
        {main}
      </div>
    </div>
  );
}
