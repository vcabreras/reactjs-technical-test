import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { notify } from '@/components/ui';
import { API_URL } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderRoute } from '@/test/render';

afterEach(() => {
  act(() => {
    notify.dismiss();
  });
});

function getPostTitles(): string[] {
  const list = screen.getByRole('list', { name: 'Publicaciones' });
  return within(list)
    .getAllByRole('article')
    .map((article) => within(article).getByRole('heading').textContent ?? '');
}

/** Sección de publicaciones (en escritorio también se ve el listado de usuarios). */
function getPostsSection() {
  return screen.getByRole('region', { name: /publicaciones/i });
}

function getForm() {
  return screen.getByRole('form', { name: 'Nueva publicación' });
}

/** Abre el panel lateral con el formulario (el botón aparece cuando la lista está cargada). */
async function openForm() {
  await userEvent.click(await screen.findByRole('button', { name: 'Nueva publicación' }));
  return getForm();
}

async function fillAndSubmit(title: string, body: string) {
  const form = getForm();
  if (title) await userEvent.type(within(form).getByLabelText(/Título/), title);
  if (body) await userEvent.type(within(form).getByLabelText(/Texto/), body);
  await userEvent.click(within(form).getByRole('button', { name: 'Publicar' }));
}

/** Registra los POST a /posts y deja que responda el handler por defecto. */
function recordCreateRequests() {
  const calls: unknown[] = [];
  server.use(
    http.post(`${API_URL}/posts`, async ({ request }) => {
      calls.push(await request.clone().json());
    }),
  );
  return calls;
}

describe('UserPostsPanel', () => {
  it('muestra el usuario y sus publicaciones', async () => {
    renderRoute({ path: '/users/1' });

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Leanne Graham' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sincere@april.biz · Bret Inc')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 3, name: '2 publicaciones' })).toBeVisible();
    await waitFor(() => {
      expect(getPostTitles()).toEqual(['Primer post de Leanne', 'Segundo post de Leanne']);
    });
    await waitFor(() => {
      expect(document.title).toBe('Leanne Graham · Usuarios');
    });
  });

  it('carga por deep link un usuario que no está en la página visible del listado', async () => {
    renderRoute({ path: '/users/6' });

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Mrs. Dennis Schulist' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Este usuario no tiene publicaciones')).toBeInTheDocument();
  });

  it.each(['/users/999', '/users/abc'])(
    '%s muestra "Usuario no encontrado" con enlace al listado',
    async (path) => {
      renderRoute({ path });

      expect(await screen.findByText('Usuario no encontrado')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Ver la lista de usuarios' })).toHaveAttribute(
        'href',
        '/users',
      );
    },
  );

  it('si fallan las publicaciones muestra el error y se recupera al reintentar', async () => {
    server.use(
      http.get(`${API_URL}/posts`, () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    renderRoute({ path: '/users/1' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudieron cargar las publicaciones');

    await userEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => {
      expect(getPostTitles()).toHaveLength(2);
    });
  });

  describe('paginación (en cliente: incluye los posts creados)', () => {
    const CLEMENTINE_PAGE_1 = [1, 2, 3, 4, 5].map((n) => `Post ${n} de Clementine`);

    it('muestra 5 publicaciones por página y navega entre páginas', async () => {
      renderRoute({ path: '/users/3' });

      await waitFor(() => {
        expect(getPostTitles()).toEqual(CLEMENTINE_PAGE_1);
      });
      const nav = screen.getByRole('navigation', { name: 'Paginación de publicaciones' });
      expect(within(getPostsSection()).getByText('Mostrando 1–5 de 7')).toBeInTheDocument();

      await userEvent.click(within(nav).getByRole('button', { name: 'Página siguiente' }));

      expect(getPostTitles()).toEqual(['Post 6 de Clementine', 'Post 7 de Clementine']);
      expect(within(getPostsSection()).getByText('Mostrando 6–7 de 7')).toBeInTheDocument();
    });

    it('al cambiar de página la lista de publicaciones vuelve arriba', async () => {
      renderRoute({ path: '/users/3' });
      await waitFor(() => {
        expect(getPostTitles()).toEqual(CLEMENTINE_PAGE_1);
      });
      const scrollArea = screen.getByRole('list', { name: 'Publicaciones' }).parentElement;
      if (!scrollArea) throw new Error('Sin zona de scroll');
      scrollArea.scrollTop = 200;

      await userEvent.click(
        within(getPostsSection()).getByRole('button', { name: 'Página siguiente' }),
      );

      const newScrollArea = screen.getByRole('list', { name: 'Publicaciones' }).parentElement;
      expect(newScrollArea).not.toBe(scrollArea);
      expect(newScrollArea?.scrollTop).toBe(0);
    });

    it('al crear una publicación vuelve a la página 1 y la cuenta en el total', async () => {
      renderRoute({ path: '/users/3' });
      await waitFor(() => {
        expect(getPostTitles()).toEqual(CLEMENTINE_PAGE_1);
      });
      await userEvent.click(
        within(getPostsSection()).getByRole('button', { name: 'Página siguiente' }),
      );

      await openForm();
      await fillAndSubmit('Nuevo de Clementine', 'Texto');

      await waitFor(() => {
        expect(getPostTitles()[0]).toBe('Nuevo de Clementine');
      });
      expect(getPostTitles()).toHaveLength(5);
      expect(within(getPostsSection()).getByText('Mostrando 1–5 de 8')).toBeInTheDocument();
    });

    it('con una sola página no muestra la navegación', async () => {
      renderRoute({ path: '/users/1' });
      await waitFor(() => {
        expect(getPostTitles()).toHaveLength(2);
      });

      expect(
        screen.queryByRole('navigation', { name: 'Paginación de publicaciones' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('formulario de nueva publicación (panel lateral)', () => {
    it('el botón abre un diálogo con el formulario y se puede cerrar', async () => {
      renderRoute({ path: '/users/1' });

      await openForm();
      const dialog = screen.getByRole('dialog', { name: 'Nueva publicación' });
      expect(dialog).toHaveAccessibleDescription('Se publicará como Leanne Graham.');

      await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await openForm();
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('valida título y texto obligatorios (también solo espacios) sin llamar a la API', async () => {
      const calls = recordCreateRequests();
      renderRoute({ path: '/users/1' });
      await openForm();

      await fillAndSubmit('   ', '');

      const form = getForm();
      const titleInput = within(form).getByLabelText(/Título/);
      expect(titleInput).toHaveAccessibleDescription(/El título es obligatorio\./);
      expect(within(form).getByLabelText(/Texto/)).toHaveAccessibleDescription(
        /El texto es obligatorio\./,
      );
      expect(titleInput).toHaveFocus();
      expect(calls).toHaveLength(0);
    });

    it('muestra el contador de caracteres', async () => {
      renderRoute({ path: '/users/1' });
      const form = await openForm();

      await userEvent.type(within(form).getByLabelText(/Título/), 'Hola');

      expect(within(form).getByLabelText(/Título/)).toHaveAccessibleDescription(
        '4 de 100 caracteres',
      );
    });

    it('crea la publicación: aparece la primera, notifica, cierra el panel y lo deja vacío', async () => {
      const calls = recordCreateRequests();
      renderRoute({ path: '/users/1' });
      await openForm();

      await fillAndSubmit('  Mi post  ', 'Contenido');

      await waitFor(() => {
        expect(getPostTitles()).toEqual([
          'Mi post',
          'Primer post de Leanne',
          'Segundo post de Leanne',
        ]);
      });
      expect(calls).toEqual([{ userId: 1, title: 'Mi post', body: 'Contenido' }]);
      expect(await screen.findByText('Publicación creada')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const form = await openForm();
      expect(within(form).getByLabelText(/Título/)).toHaveValue('');
      expect(within(form).getByLabelText(/Texto/)).toHaveValue('');
    });

    it('no permite doble envío mientras se publica', async () => {
      const calls: unknown[] = [];
      server.use(
        http.post(`${API_URL}/posts`, async ({ request }) => {
          calls.push(await request.json());
          await delay(100);
          return HttpResponse.json({ ...(calls.at(-1) as object), id: 101 }, { status: 201 });
        }),
      );
      renderRoute({ path: '/users/1' });
      await openForm();

      await fillAndSubmit('Título', 'Texto');
      const submitting = within(getForm()).getByRole('button', { name: 'Publicando…' });
      expect(submitting).toBeDisabled();
      await userEvent.click(submitting);

      await waitFor(() => {
        expect(getPostTitles()[0]).toBe('Título');
      });
      expect(calls).toHaveLength(1);
    });

    it('si la API falla notifica el error, mantiene el panel abierto y conserva lo escrito', async () => {
      server.use(http.post(`${API_URL}/posts`, () => new HttpResponse(null, { status: 500 })));
      renderRoute({ path: '/users/1' });
      await openForm();

      await fillAndSubmit('Título', 'Texto');

      expect(await screen.findByText('No se pudo crear la publicación')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(within(getForm()).getByLabelText(/Título/)).toHaveValue('Título');
      expect(within(getForm()).getByLabelText(/Texto/)).toHaveValue('Texto');
      expect(getPostTitles()).toHaveLength(2);
    });

    it('la publicación creada sigue en la lista al ir a otro usuario y volver', async () => {
      const { router } = renderRoute({ path: '/users/1' });
      await openForm();
      await fillAndSubmit('Persistente', 'En caché');
      await waitFor(() => {
        expect(getPostTitles()[0]).toBe('Persistente');
      });

      await act(() => router.navigate('/users/2'));
      expect(await screen.findByRole('heading', { level: 2, name: 'Ervin Howell' })).toBeVisible();
      await act(() => router.navigate('/users/1'));

      await screen.findByRole('heading', { level: 2, name: 'Leanne Graham' });
      expect(getPostTitles()).toEqual([
        'Persistente',
        'Primer post de Leanne',
        'Segundo post de Leanne',
      ]);
    });
  });
});
