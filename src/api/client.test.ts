import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { request } from './client';
import { ApiError } from './errors';

const ItemSchema = z.object({ id: z.number(), name: z.string() });
const url = `${API_URL}/items`;

/** Ejecuta la promesa y devuelve el `ApiError` lanzado (falla si no lanza o lanza otra cosa). */
async function catchApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => {
      throw new Error('Se esperaba que la petición fallara');
    },
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('request', () => {
  it('devuelve los datos validados y descarta claves desconocidas', async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: 1, name: 'A', extra: true })));

    await expect(request('/items', { schema: ItemSchema })).resolves.toEqual({ id: 1, name: 'A' });
  });

  it('serializa query params omitiendo undefined, null y vacíos', async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(url, ({ request: req }) => {
        receivedUrl = new URL(req.url);
        return HttpResponse.json([]);
      }),
    );

    await request('/items', {
      schema: ItemSchema.array(),
      query: { a: 1, b: 'x y', c: undefined, d: null, e: '' },
    });

    expect(receivedUrl?.search).toBe('?a=1&b=x+y');
  });

  it('envía el body como JSON en peticiones POST', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(url, async ({ request: req }) => {
        receivedBody = await req.json();
        return HttpResponse.json({ id: 1, name: 'A' }, { status: 201 });
      }),
    );

    await request('/items', { method: 'POST', body: { name: 'A' }, schema: ItemSchema });

    expect(receivedBody).toEqual({ name: 'A' });
  });

  it('lanza ApiError http con el status ante una respuesta no-ok', async () => {
    server.use(http.get(url, () => new HttpResponse(null, { status: 500 })));

    const error = await catchApiError(request('/items', { schema: ItemSchema }));

    expect(error.kind).toBe('http');
    expect(error.status).toBe(500);
  });

  it('lanza ApiError parse si la respuesta no cumple el esquema', async () => {
    server.use(http.get(url, () => HttpResponse.json({ id: 'no-es-numero' })));

    const error = await catchApiError(request('/items', { schema: ItemSchema }));

    expect(error.kind).toBe('parse');
    expect(error.cause).toBeInstanceOf(z.ZodError);
  });

  it('lanza ApiError parse si la respuesta no es JSON', async () => {
    server.use(http.get(url, () => HttpResponse.text('<html>')));

    const error = await catchApiError(request('/items', { schema: ItemSchema }));

    expect(error.kind).toBe('parse');
  });

  it('lanza ApiError network ante un fallo de red', async () => {
    server.use(http.get(url, () => HttpResponse.error()));

    const error = await catchApiError(request('/items', { schema: ItemSchema }));

    expect(error.kind).toBe('network');
  });

  it('lanza ApiError timeout si el servidor no responde a tiempo', async () => {
    server.use(
      http.get(url, async () => {
        await delay(200);
        return HttpResponse.json({ id: 1, name: 'A' });
      }),
    );

    const error = await catchApiError(request('/items', { schema: ItemSchema, timeoutMs: 20 }));

    expect(error.kind).toBe('timeout');
  });

  it('lanza ApiError aborted si quien llama cancela la petición', async () => {
    server.use(
      http.get(url, async () => {
        await delay(200);
        return HttpResponse.json({ id: 1, name: 'A' });
      }),
    );
    const controller = new AbortController();

    const promise = request('/items', { schema: ItemSchema, signal: controller.signal });
    controller.abort();
    const error = await catchApiError(promise);

    expect(error.kind).toBe('aborted');
  });
});
