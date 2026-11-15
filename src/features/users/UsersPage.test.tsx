import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderRoute } from '@/test/render';

/** Registra las URLs pedidas a `/users` sin responder: el handler por defecto contesta. */
function recordUsersRequests(): URL[] {
  const urls: URL[] = [];
  server.use(
    http.get(`${API_URL}/users`, ({ request }) => {
      urls.push(new URL(request.url));
    }),
  );
  return urls;
}

/** Nombre accesible de un enlace etiquetado con aria-labelledby. */
function getLabelledName(element: HTMLElement): string {
  const ids = element.getAttribute('aria-labelledby')?.split(' ') ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
}

/** Nombres de los usuarios visibles (en el orden en que llegan del servidor). */
function getUserNames(): string[] {
  const list = screen.getByRole('list', { name: 'Usuarios' });
  return within(list).getAllByRole('link').map(getLabelledName);
}

async function waitForUsers(expected: string[]) {
  await waitFor(() => {
    expect(getUserNames()).toEqual(expected);
  });
}

/** Todos los usuarios de los fixtures, ordenados por nombre (como los devuelve el servidor). */
const ALL_USERS = [
  'Chelsey Dietrich',
  'Clementine Bauch',
  'Ervin Howell',
  'Kurtis Weissnat',
  'Leanne Graham',
  'Mrs. Dennis Schulist',
  'Patricia Lebsack',
];

describe('UsersPage', () => {
  it('muestra la carga y luego todos los usuarios ordenados por nombre, sin paginación', async () => {
    const requests = recordUsersRequests();
    renderRoute({ path: '/users' });

    expect(screen.getByText('Cargando usuarios…')).toBeInTheDocument();

    await waitForUsers(ALL_USERS);
    expect(screen.getByText('Selecciona un usuario')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Paginación/ })).not.toBeInTheDocument();
    expect(requests[0]?.searchParams.get('_sort')).toBe('name');
    expect(requests[0]?.searchParams.has('_page')).toBe(false);
  });

  it('busca en el servidor con debounce y guarda el término en la URL', async () => {
    const requests = recordUsersRequests();
    const { router } = renderRoute({ path: '/users' });
    await waitForUsers(ALL_USERS);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar usuarios por nombre' }),
      'lea',
    );

    await waitForUsers(['Leanne Graham']);
    expect(router.state.location.search).toBe('?q=lea');
    // Debounce: una sola petición con el término completo, no una por tecla.
    const searchRequests = requests.filter((url) => url.searchParams.has('name_like'));
    expect(searchRequests.map((url) => url.searchParams.get('name_like'))).toEqual(['lea']);
  });

  it('al buscar, la lista vuelve arriba aunque se hubiera hecho scroll', async () => {
    renderRoute({ path: '/users' });
    await waitForUsers(ALL_USERS);
    const scrollArea = screen.getByRole('list', { name: 'Usuarios' }).parentElement;
    if (!scrollArea) throw new Error('Sin zona de scroll');
    scrollArea.scrollTop = 200;

    await userEvent.type(screen.getByRole('searchbox'), 'e');

    await waitFor(() => {
      expect(screen.getByRole('list', { name: 'Usuarios' }).parentElement).not.toBe(scrollArea);
    });
    expect(screen.getByRole('list', { name: 'Usuarios' }).parentElement?.scrollTop).toBe(0);
  });

  it('lee la búsqueda inicial de la URL', async () => {
    renderRoute({ path: '/users?q=mrs.' });

    await waitForUsers(['Mrs. Dennis Schulist']);
    expect(screen.getByRole('searchbox')).toHaveValue('mrs.');
  });

  it('sin resultados muestra el estado vacío y permite ver todos los usuarios', async () => {
    const { router } = renderRoute({ path: '/users?q=zzz' });

    expect(await screen.findByText('No hay usuarios que coincidan con "zzz"')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ver todos los usuarios' }));

    await waitForUsers(ALL_USERS);
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(router.state.location.search).toBe('');
  });

  it('muestra el error del servidor y se recupera al reintentar', async () => {
    server.use(
      http.get(`${API_URL}/users`, () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    renderRoute({ path: '/users' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'El servidor no está disponible. Inténtalo de nuevo más tarde.',
    );

    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    await waitForUsers(ALL_USERS);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('al elegir un usuario navega a su detalle conservando la búsqueda', async () => {
    const { router } = renderRoute({ path: '/users?q=lea' });
    await waitForUsers(['Leanne Graham']);

    await userEvent.click(screen.getByRole('link', { name: 'Leanne Graham' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/users/1');
    });
    expect(router.state.location.search).toBe('?q=lea');
  });
});
