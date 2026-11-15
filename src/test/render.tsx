import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { appRoutes } from '@/app/routes';

/** QueryClient aislado por test: sin reintentos ni caché compartida entre tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderRouteOptions {
  /** Ruta inicial, p. ej. `/users?q=lea`. */
  path?: string;
  routes?: RouteObject[];
  queryClient?: QueryClient;
}

/** Renderiza las rutas reales (o unas dadas) con router en memoria y QueryClient de test. */
export function renderRoute({
  path = '/',
  routes = appRoutes,
  queryClient = createTestQueryClient(),
}: RenderRouteOptions = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router, queryClient };
}
