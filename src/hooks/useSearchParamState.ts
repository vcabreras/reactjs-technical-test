import { useSearchParams } from 'react-router';

/**
 * Estado de texto persistido en un query param de la URL (fuente de verdad única).
 * Vacío ⇒ se elimina el param. Reemplaza la entrada del historial para no apilar una por tecla.
 */
export function useSearchParamState(param: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(param) ?? '';

  const setValue = (next: string) => {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next) params.set(param, next);
        else params.delete(param);
        return params;
      },
      { replace: true },
    );
  };

  return [value, setValue] as const;
}
