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

/** Nombres de las filas de datos visibles (en el orden en que llegan del servidor). */
function getRowNames(): string[] {
  const body = screen.getAllByRole('rowgroup')[1];
  if (!body) throw new Error('No hay tbody');
  return within(body)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '');
}

async function waitForRows(expected: string[]) {
  await waitFor(() => {
    expect(getRowNames()).toEqual(expected);
  });
}

const PAGE_1 = [
  'Chelsey Dietrich',
  'Clementine Bauch',
  'Ervin Howell',
  'Kurtis Weissnat',
  'Leanne Graham',
];

describe('UsersPage', () => {
  it('muestra la carga y luego la primera página ordenada por nombre', async () => {
    renderRoute({ path: '/users' });

    expect(screen.getByText('Cargando usuarios…')).toBeInTheDocument();

    await waitForRows(PAGE_1);
    expect(screen.getByText('7 usuarios')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–5 de 7')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un usuario')).toBeInTheDocument();
  });

  it('busca en el servidor con debounce y guarda el término en la URL', async () => {
    const requests = recordUsersRequests();
    const { router } = renderRoute({ path: '/users' });
    await waitForRows(PAGE_1);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar usuarios por nombre' }),
      'lea',
    );

    await waitForRows(['Leanne Graham']);
    expect(router.state.location.search).toBe('?q=lea');
    // Debounce: una sola petición con el término completo, no una por tecla.
    const searchRequests = requests.filter((url) => url.searchParams.has('name_like'));
    expect(searchRequests.map((url) => url.searchParams.get('name_like'))).toEqual(['lea']);
  });

  it('buscar vuelve a la página 1', async () => {
    const { router } = renderRoute({ path: '/users?page=2' });
    await waitForRows(['Mrs. Dennis Schulist', 'Patricia Lebsack']);

    await userEvent.type(screen.getByRole('searchbox'), 'e');

    await waitFor(() => {
      expect(router.state.location.search).toBe('?q=e');
    });
  });

  it('sin resultados muestra el estado vacío y permite ver todos los usuarios', async () => {
    renderRoute({ path: '/users?q=zzz' });

    expect(await screen.findByText('No hay usuarios que coincidan con "zzz"')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ver todos los usuarios' }));

    await waitForRows(PAGE_1);
    expect(screen.getByRole('searchbox')).toHaveValue('');
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

    await waitForRows(PAGE_1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pagina en el servidor y guarda la página en la URL', async () => {
    const { router } = renderRoute({ path: '/users' });
    await waitForRows(PAGE_1);

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));

    await waitForRows(['Mrs. Dennis Schulist', 'Patricia Lebsack']);
    expect(router.state.location.search).toBe('?page=2');
    expect(screen.getByText('Mostrando 6–7 de 7')).toBeInTheDocument();
  });

  it('ordena en el servidor al pulsar una cabecera y vuelve a la página 1', async () => {
    const { router } = renderRoute({ path: '/users?page=2' });
    await waitForRows(['Mrs. Dennis Schulist', 'Patricia Lebsack']);

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }));

    await waitForRows([
      'Patricia Lebsack',
      'Mrs. Dennis Schulist',
      'Leanne Graham',
      'Kurtis Weissnat',
      'Ervin Howell',
    ]);
    expect(router.state.location.search).toBe('?order=desc');
    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('normaliza params de URL inválidos antes de pedir al servidor', async () => {
    const requests = recordUsersRequests();
    renderRoute({ path: '/users?page=abc&limit=7&sort=password&order=x' });

    await waitForRows(PAGE_1);
    const params = requests[0]?.searchParams;
    expect(params?.get('_page')).toBe('1');
    expect(params?.get('_limit')).toBe('5');
    expect(params?.get('_sort')).toBe('name');
    expect(params?.get('_order')).toBe('asc');
  });

  it('una página fuera de rango ofrece volver a la primera', async () => {
    renderRoute({ path: '/users?page=9' });

    await userEvent.click(await screen.findByRole('button', { name: 'Ir a la primera página' }));

    await waitForRows(PAGE_1);
  });

  it('al elegir un usuario navega a su detalle conservando la búsqueda', async () => {
    const { router } = renderRoute({ path: '/users?q=lea' });
    await waitForRows(['Leanne Graham']);

    await userEvent.click(screen.getByRole('link', { name: 'Leanne Graham' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/users/1');
    });
    expect(router.state.location.search).toBe('?q=lea');
  });
});
