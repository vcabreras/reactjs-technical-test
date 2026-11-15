import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { ApiError } from './errors';
import { createPost, getPostsByUser } from './posts';

describe('getPostsByUser', () => {
  it('pide los posts filtrando por userId y normaliza el id a string', async () => {
    const posts = await getPostsByUser(1);

    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual({
      id: '1',
      userId: 1,
      title: 'Primer post de Leanne',
      body: 'Cuerpo 1',
    });
  });
});

describe('createPost', () => {
  it('envía los datos recortados y devuelve el post creado', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${API_URL}/posts`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ ...(receivedBody as object), id: 101 }, { status: 201 });
      }),
    );

    const post = await createPost({ userId: 1, title: '  Hola  ', body: ' Mundo ' });

    expect(receivedBody).toEqual({ userId: 1, title: 'Hola', body: 'Mundo' });
    expect(post).toMatchObject({ userId: 1, title: 'Hola', body: 'Mundo' });
  });

  it('genera un id único en cliente aunque la API devuelva siempre 101', async () => {
    const first = await createPost({ userId: 1, title: 'A', body: 'A' });
    const second = await createPost({ userId: 1, title: 'B', body: 'B' });

    expect(first.id).not.toBe('101');
    expect(first.id).not.toBe(second.id);
  });

  it('lanza ApiError validation y no llama a la API si la entrada es inválida', async () => {
    let called = false;
    server.use(
      http.post(`${API_URL}/posts`, () => {
        called = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const error: unknown = await createPost({ userId: 1, title: '   ', body: 'x' }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('validation');
    expect(called).toBe(false);
  });
});
