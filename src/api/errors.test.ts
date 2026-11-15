import { describe, expect, it } from 'vitest';
import { ApiError, getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it.each([
    [new ApiError({ kind: 'http', status: 404, message: '' }), 'El recurso solicitado no existe.'],
    [
      new ApiError({ kind: 'http', status: 503, message: '' }),
      'El servidor no está disponible. Inténtalo de nuevo más tarde.',
    ],
    [new ApiError({ kind: 'http', status: 400, message: '' }), 'No se pudo completar la petición.'],
    [
      new ApiError({ kind: 'network', message: '' }),
      'No hay conexión con el servidor. Revisa tu conexión a internet.',
    ],
    [
      new ApiError({ kind: 'timeout', message: '' }),
      'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
    ],
    [
      new ApiError({ kind: 'parse', message: '' }),
      'El servidor devolvió una respuesta inesperada.',
    ],
  ])('traduce %o a un mensaje de usuario', (error, expected) => {
    expect(getErrorMessage(error)).toBe(expected);
  });

  it('usa un mensaje genérico para errores que no son ApiError', () => {
    expect(getErrorMessage(new TypeError('boom'))).toBe('Ha ocurrido un error inesperado.');
    expect(getErrorMessage('texto')).toBe('Ha ocurrido un error inesperado.');
  });
});

describe('ApiError', () => {
  it('expone kind, status, cause e isNotFound', () => {
    const cause = new Error('original');
    const error = new ApiError({ kind: 'http', status: 404, message: 'GET /x', cause });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.cause).toBe(cause);
    expect(error.isNotFound).toBe(true);
  });
});
