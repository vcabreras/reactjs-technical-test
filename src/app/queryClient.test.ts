import { describe, expect, it } from 'vitest';
import { ApiError, type ApiErrorKind } from '@/api/errors';
import { shouldRetry } from './queryClient';

const apiError = (kind: ApiErrorKind, status?: number) =>
  new ApiError({ kind, status, message: 'test' });

describe('shouldRetry', () => {
  it.each([
    ['red', apiError('network')],
    ['timeout', apiError('timeout')],
    ['HTTP 503', apiError('http', 503)],
  ])('reintenta una vez un fallo transitorio (%s)', (_, error) => {
    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(false);
  });

  it.each([
    ['HTTP 404', apiError('http', 404)],
    ['HTTP 400', apiError('http', 400)],
    ['parse', apiError('parse')],
    ['validation', apiError('validation')],
    ['aborted', apiError('aborted')],
    ['config', apiError('config')],
  ])('no reintenta errores que no son transitorios (%s)', (_, error) => {
    expect(shouldRetry(0, error)).toBe(false);
  });

  it('no reintenta errores que no son ApiError', () => {
    expect(shouldRetry(0, new Error('boom'))).toBe(false);
  });
});
