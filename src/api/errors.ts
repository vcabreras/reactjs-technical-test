export type ApiErrorKind =
  /** Respuesta HTTP no-ok (4xx / 5xx). */
  | 'http'
  /** No se pudo contactar con el servidor. */
  | 'network'
  /** El servidor no respondió dentro del tiempo límite. */
  | 'timeout'
  /** La petición fue cancelada por quien la lanzó (p. ej. TanStack Query). */
  | 'aborted'
  /** La respuesta no es JSON válido o no cumple el esquema. */
  | 'parse'
  /** Los datos de entrada no cumplen su esquema; la petición no llega a enviarse. */
  | 'validation'
  /** Configuración ausente o inválida (p. ej. `VITE_API_URL`). */
  | 'config';

interface ApiErrorOptions {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  cause?: unknown;
}

/** Único tipo de error que puede salir de la capa `api/`. */
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor({ kind, message, status, cause }: ApiErrorOptions) {
    super(message, { cause });
    this.kind = kind;
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.kind === 'http' && this.status === 404;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const FALLBACK_MESSAGE = 'Ha ocurrido un error inesperado.';

/** Traduce cualquier error a un mensaje apto para mostrar al usuario. */
export function getErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return FALLBACK_MESSAGE;
  }

  switch (error.kind) {
    case 'http':
      if (error.status === 404) return 'El recurso solicitado no existe.';
      if (error.status !== undefined && error.status >= 500) {
        return 'El servidor no está disponible. Inténtalo de nuevo más tarde.';
      }
      return 'No se pudo completar la petición.';
    case 'network':
      return 'No hay conexión con el servidor. Revisa tu conexión a internet.';
    case 'timeout':
      return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
    case 'aborted':
      return 'La petición fue cancelada.';
    case 'parse':
      return 'El servidor devolvió una respuesta inesperada.';
    case 'validation':
      return 'Los datos enviados no son válidos.';
    case 'config':
      return 'La aplicación no está configurada correctamente.';
  }
}
