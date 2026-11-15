import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { ApiError } from './errors';
import { getUserById, getUsers } from './users';

/** Registra un listener que captura la URL de la siguiente petición a `/users`. */
function captureUsersRequest(): () => URL | undefined {
  let captured: URL | undefined;
  server.use(
    http.get(`${API_URL}/users`, ({ request }) => {
      captured = new URL(request.url);
      return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
    }),
  );
  return () => captured;
}

describe('getUsers', () => {
  it('envía búsqueda, paginación y ordenación como params de json-server', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: 'lean', page: 2, limit: 5, sort: 'email', order: 'desc' });

    const params = getUrl()?.searchParams;
    expect(params?.get('name_like')).toBe('lean');
    expect(params?.get('_page')).toBe('2');
    expect(params?.get('_limit')).toBe('5');
    expect(params?.get('_sort')).toBe('email');
    expect(params?.get('_order')).toBe('desc');
  });

  it('escapa el término de búsqueda y recorta espacios', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: '  mrs. (d ', page: 1, limit: 5 });

    expect(getUrl()?.searchParams.get('name_like')).toBe('mrs\\. \\(d');
  });

  it('omite name_like con búsqueda vacía y _order sin _sort', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: '   ', page: 1, limit: 5, order: 'asc' });

    const params = getUrl()?.searchParams;
    expect(params?.has('name_like')).toBe(false);
    expect(params?.has('_order')).toBe(false);
  });

  it('devuelve los usuarios filtrados y el total del servidor', async () => {
    const result = await getUsers({ search: 'mrs. d', page: 1, limit: 5 });

    expect(result.total).toBe(1);
    expect(result.data.map((u) => u.name)).toEqual(['Mrs. Dennis Schulist']);
  });

  it('pagina en el servidor y devuelve el total sin paginar', async () => {
    const result = await getUsers({ page: 2, limit: 5, sort: 'name', order: 'asc' });

    expect(result.total).toBe(7);
    expect(result.data).toHaveLength(2);
  });
});

describe('getUserById', () => {
  it('devuelve el usuario validado', async () => {
    const user = await getUserById(1);

    expect(user).toMatchObject({ id: 1, name: 'Leanne Graham', address: { city: 'Gwenborough' } });
  });

  it('lanza ApiError 404 si el usuario no existe', async () => {
    const error: unknown = await getUserById(999).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isNotFound).toBe(true);
  });
});
