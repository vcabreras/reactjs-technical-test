import type { z } from 'zod';
import { ApiError } from './errors';
import type { Paginated } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

interface BaseRequestOptions {
  method?: HttpMethod;
  /** Los valores `undefined`, `null` y `''` se omiten. */
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface RequestOptions<TSchema extends z.ZodType> extends BaseRequestOptions {
  schema: TSchema;
}

export interface PaginatedRequestOptions<TItemSchema extends z.ZodType> extends BaseRequestOptions {
  itemSchema: TItemSchema;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const TOTAL_COUNT_HEADER = 'X-Total-Count';

function getBaseUrl(): string {
  const baseUrl: unknown = import.meta.env.VITE_API_URL;

  if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
    throw new ApiError({ kind: 'config', message: 'VITE_API_URL no está definida.' });
  }

  return baseUrl.replace(/\/+$/, '');
}

function buildUrl(path: string, query: BaseRequestOptions['query']): URL {
  const url = new URL(`${getBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  return url;
}

/** Ejecuta la petición y garantiza una `Response` ok; cualquier otro resultado es `ApiError`. */
async function send(path: string, options: BaseRequestOptions): Promise<Response> {
  const { method = 'GET', query, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = buildUrl(path, query);
  const label = `${method} ${url.pathname}`;

  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      signal: combinedSignal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json; charset=UTF-8' }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new ApiError({ kind: 'aborted', message: `${label}: cancelada`, cause: error });
    }
    if (timeoutSignal.aborted) {
      throw new ApiError({
        kind: 'timeout',
        message: `${label}: sin respuesta en ${timeoutMs} ms`,
        cause: error,
      });
    }
    throw new ApiError({ kind: 'network', message: `${label}: error de red`, cause: error });
  }

  if (!response.ok) {
    throw new ApiError({
      kind: 'http',
      status: response.status,
      message: `${label}: HTTP ${response.status}`,
    });
  }

  return response;
}

async function parseBody<TSchema extends z.ZodType>(
  response: Response,
  schema: TSchema,
  label: string,
): Promise<z.output<TSchema>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch (error) {
    throw new ApiError({
      kind: 'parse',
      message: `${label}: la respuesta no es JSON`,
      cause: error,
    });
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    throw new ApiError({
      kind: 'parse',
      message: `${label}: la respuesta no cumple el esquema`,
      cause: result.error,
    });
  }

  return result.data;
}

function parseTotalCount(response: Response, label: string): number {
  const raw = response.headers.get(TOTAL_COUNT_HEADER);
  const total = raw === null || raw.trim() === '' ? Number.NaN : Number(raw);

  if (!Number.isInteger(total) || total < 0) {
    throw new ApiError({
      kind: 'parse',
      message: `${label}: cabecera ${TOTAL_COUNT_HEADER} ausente o inválida (${String(raw)})`,
    });
  }

  return total;
}

/** Petición JSON validada con Zod. */
export async function request<TSchema extends z.ZodType>(
  path: string,
  { schema, ...options }: RequestOptions<TSchema>,
): Promise<z.output<TSchema>> {
  const response = await send(path, options);
  return parseBody(response, schema, `${options.method ?? 'GET'} ${path}`);
}

/** Petición de un listado paginado: valida cada elemento y lee el total de `X-Total-Count`. */
export async function requestPaginated<TItemSchema extends z.ZodType>(
  path: string,
  { itemSchema, ...options }: PaginatedRequestOptions<TItemSchema>,
): Promise<Paginated<z.output<TItemSchema>>> {
  const response = await send(path, options);
  const label = `${options.method ?? 'GET'} ${path}`;
  const total = parseTotalCount(response, label);
  const data = await parseBody(response, itemSchema.array(), label);

  return { data, total };
}
