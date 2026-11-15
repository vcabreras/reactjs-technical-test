import { http, HttpResponse } from 'msw';
import { posts, type RawPost, type RawUser, users } from './fixtures';

export const API_URL = import.meta.env.VITE_API_URL;

/** Réplica mínima de json-server: `name_like` (regex, case-insensitive), `_sort`, `_order`. */
function queryUsers(url: URL): RawUser[] | null {
  const nameLike = url.searchParams.get('name_like');
  const sort = url.searchParams.get('_sort') as keyof RawUser | null;
  const order = url.searchParams.get('_order') === 'desc' ? -1 : 1;

  let pattern: RegExp | null = null;
  try {
    pattern = nameLike ? new RegExp(nameLike, 'i') : null;
  } catch {
    // Como json-server: una regex inválida rompe el servidor (HTTP 500).
    return null;
  }

  const result = pattern ? users.filter((u) => pattern.test(u.name)) : [...users];

  if (sort) {
    result.sort((a, b) => String(a[sort]).localeCompare(String(b[sort])) * order);
  }

  return result;
}

export const handlers = [
  http.get(`${API_URL}/users`, ({ request }) => {
    const result = queryUsers(new URL(request.url));
    if (!result) return new HttpResponse(null, { status: 500 });
    return HttpResponse.json(result);
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) => {
    const user = users.find((u) => String(u.id) === params.id);
    return user ? HttpResponse.json(user) : HttpResponse.json({}, { status: 404 });
  }),

  http.get(`${API_URL}/posts`, ({ request }) => {
    const userId = new URL(request.url).searchParams.get('userId');
    return HttpResponse.json(posts.filter((p) => String(p.userId) === userId));
  }),

  http.post(`${API_URL}/posts`, async ({ request }) => {
    const body = (await request.json()) as Omit<RawPost, 'id'>;
    // Igual que JSONPlaceholder: siempre id 101.
    return HttpResponse.json({ ...body, id: 101 }, { status: 201 });
  }),
];
