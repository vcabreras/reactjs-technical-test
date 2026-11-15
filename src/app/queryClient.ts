import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';

const MAX_RETRIES = 1;

/**
 * Solo se reintentan fallos transitorios (red, timeout, 5xx), una vez.
 * Un 4xx, una respuesta que no cumple el esquema o una cancelación no mejoran reintentando.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES || !isApiError(error)) {
    return false;
  }

  switch (error.kind) {
    case 'network':
    case 'timeout':
      return true;
    case 'http':
      return error.status !== undefined && error.status >= 500;
    default:
      return false;
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
