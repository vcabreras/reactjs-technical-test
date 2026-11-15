import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type HeadingLevel = 1 | 2;

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Botones u otras acciones alineadas a la derecha (debajo en móvil). */
  actions?: ReactNode;
  /** 1 para la página principal, 2 para paneles de detalle. */
  headingLevel?: HeadingLevel;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  headingLevel = 1,
  className,
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      className={cx(
        'd-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3',
        className,
      )}
    >
      <div className="min-w-0">
        <Heading className={cx('mb-0 text-break', headingLevel === 1 ? 'h3' : 'h4')}>
          {title}
        </Heading>
        {subtitle && <p className="text-body-secondary mb-0 mt-1 text-break">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
