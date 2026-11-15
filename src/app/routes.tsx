import { Navigate, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout';
import { SelectUserHint, UsersPage } from '@/features/users/UsersPage';
import { NotFoundPage } from './NotFoundPage';
import { RouteErrorBoundary } from './RouteErrorBoundary';

/**
 * Rutas de la app. El `ErrorBoundary` va en una ruta sin path dentro del layout para que un
 * error en una página mantenga navbar y footer; el del nivel raíz cubre fallos del propio layout.
 */
export const appRoutes: RouteObject[] = [
  {
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        ErrorBoundary: RouteErrorBoundary,
        children: [
          { index: true, element: <Navigate to="/users" replace /> },
          {
            path: 'users',
            Component: UsersPage,
            children: [{ index: true, Component: SelectUserHint }],
          },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];
