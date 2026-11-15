import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppLayout } from '@/components/layout';
import { renderRoute } from '@/test/render';
import { RouteErrorBoundary } from './RouteErrorBoundary';

describe('appRoutes', () => {
  it('el layout expone skip-link, navegación principal, main y footer', async () => {
    renderRoute({ path: '/no-existe' });

    expect(await screen.findByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('JSONPlaceholder');
  });

  it('una ruta desconocida muestra "Página no encontrada" con enlace a usuarios y título', async () => {
    renderRoute({ path: '/no-existe' });

    expect(await screen.findByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a usuarios' })).toHaveAttribute('href', '/users');
    await waitFor(() => {
      expect(document.title).toBe('Página no encontrada · Usuarios');
    });
  });

  it('la raíz redirige a /users', async () => {
    const { router } = renderRoute({ path: '/' });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/users');
    });
  });

  it('un error en una página se muestra dentro del layout sin romper la navegación', async () => {
    // React registra el error capturado por el boundary; se silencia para no ensuciar la salida.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function BrokenPage(): never {
      throw new Error('boom');
    }

    renderRoute({
      path: '/broken',
      routes: [
        {
          Component: AppLayout,
          children: [
            {
              ErrorBoundary: RouteErrorBoundary,
              children: [{ path: 'broken', Component: BrokenPage }],
            },
          ],
        },
      ],
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Algo salió mal');
    expect(alert).toHaveTextContent('Ha ocurrido un error inesperado.');
    expect(screen.getByRole('button', { name: 'Recargar la página' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });
});
