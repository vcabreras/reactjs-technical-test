import { Navigate, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout';
import { SelectUserHint, UsersPage } from '@/features/users/UsersPage';
import { AppLoading } from './AppLoading';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorBoundary } from './RouteErrorBoundary';

/**
 * Rutas de la app. El `ErrorBoundary` va en una ruta sin path dentro del layout para que un
 * error en una página mantenga navbar y footer; el del nivel raíz cubre fallos del propio layout.
 *
 * El detalle (`/users/:userId`) se carga en diferido: el formulario, React Hook Form y el Drawer
 * no hacen falta para pintar la lista, así que van en su propio chunk.
 */
export const appRoutes: RouteObject[] = [
  {
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    // Primera carga directa en una ruta diferida (p. ej. /users/1): se muestra mientras llega el chunk.
    HydrateFallback: AppLoading,
    children: [
      {
        ErrorBoundary: RouteErrorBoundary,
        children: [
          { index: true, element: <Navigate to="/users" replace /> },
          {
            path: 'users',
            Component: UsersPage,
            children: [
              { index: true, Component: SelectUserHint },
              {
                path: ':userId',
                lazy: async () => {
                  const { UserPostsPanel } = await import('@/features/posts/UserPostsPanel');
                  return { Component: UserPostsPanel };
                },
              },
            ],
          },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];
