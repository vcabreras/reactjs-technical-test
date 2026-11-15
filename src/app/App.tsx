import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createQueryClient } from './queryClient';
import { appRoutes } from './routes';

// Creados una sola vez fuera del árbol de React (recomendación de React Router y TanStack Query).
const queryClient = createQueryClient();
const router = createBrowserRouter(appRoutes);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
