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
      return HttpResponse.json([]);
    }),
  );
  return () => captured;
}

describe('getUsers', () => {
  it('busca con name_like y ordena por nombre en el servidor', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: 'lean' });

    const params = getUrl()?.searchParams;
    expect(params?.get('name_like')).toBe('lean');
    expect(params?.get('_sort')).toBe('name');
    expect(params?.get('_order')).toBe('asc');
    expect(params?.has('_page')).toBe(false);
  });

  it('escapa el término de búsqueda y recorta espacios', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: '  mrs. (d ' });

    expect(getUrl()?.searchParams.get('name_like')).toBe('mrs\\. \\(d');
  });

  it('omite name_like con búsqueda vacía', async () => {
    const getUrl = captureUsersRequest();

    await getUsers({ search: '   ' });

    expect(getUrl()?.searchParams.has('name_like')).toBe(false);
  });

  it('devuelve los usuarios filtrados por el servidor', async () => {
    const users = await getUsers({ search: 'mrs. d' });

    expect(users.map((u) => u.name)).toEqual(['Mrs. Dennis Schulist']);
  });

  it('devuelve todos los usuarios ordenados por nombre sin búsqueda', async () => {
    const users = await getUsers({});

    expect(users.map((u) => u.name)).toEqual([
      'Chelsey Dietrich',
      'Clementine Bauch',
      'Ervin Howell',
      'Kurtis Weissnat',
      'Leanne Graham',
      'Mrs. Dennis Schulist',
      'Patricia Lebsack',
    ]);
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
