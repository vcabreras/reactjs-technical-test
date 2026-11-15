import { Spinner } from '@/components/ui';

/** Carga inicial de una ruta diferida (`HydrateFallback`): pantalla mínima con spinner anunciado. */
export function AppLoading() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <Spinner label="Cargando la aplicación…" />
    </div>
  );
}
