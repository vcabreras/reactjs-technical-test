import { CircleAlert } from 'lucide-react';
import { cx } from '@/lib/cx';
import { Button } from '../Button/Button';

export interface ErrorStateProps {
  title?: string;
  /** Mensaje para el usuario (obtenido con `getErrorMessage`). */
  message: string;
  /** Si se pasa, muestra el botón de reintentar. */
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  className?: string;
}

/** Error de carga inline (`role="alert"`) con reintento opcional. */
export function ErrorState({
  title = 'No se pudieron cargar los datos',
  message,
  onRetry,
  isRetrying = false,
  retryLabel = 'Reintentar',
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cx('alert alert-danger d-flex gap-3 mb-0', className)}>
      <CircleAlert size={20} className="flex-shrink-0 mt-1" />
      <div className="d-flex flex-column align-items-start gap-2">
        <div>
          <p className="fw-semibold mb-1">{title}</p>
          <p className="mb-0">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="Reintentando…"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
