import { isRouteErrorResponse, useRouteError } from 'react-router';
import { getErrorMessage } from '@/api/errors';
import { ErrorState } from '@/components/ui';
import { NotFoundPage } from './NotFoundPage';

/** Error boundary de rutas: errores inesperados de render o de rutas. */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <>
      <title>Error · Usuarios</title>
      <ErrorState
        title="Algo salió mal"
        message={getErrorMessage(error)}
        onRetry={() => window.location.reload()}
        retryLabel="Recargar la página"
      />
    </>
  );
}
