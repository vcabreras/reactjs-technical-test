import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Icono decorativo; por defecto una bandeja vacía. */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Estado vacío (sin resultados, nada seleccionado…). `role="status"` para anunciarse al aparecer. */
export function EmptyState({
  title,
  description,
  icon = <Inbox size={40} strokeWidth={1.5} />,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cx(
        'd-flex flex-column align-items-center text-center gap-2 py-5 px-3 text-body-secondary',
        className,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <p className="fw-semibold text-body mb-0">{title}</p>
      {description && <p className="mb-0 small">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
