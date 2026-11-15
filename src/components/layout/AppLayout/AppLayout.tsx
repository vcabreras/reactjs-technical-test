import { UsersRound } from 'lucide-react';
import { Link, Outlet, ScrollRestoration } from 'react-router';
import { Toaster } from '@/components/ui';

export const MAIN_CONTENT_ID = 'main-content';

/** Estructura común: skip-link, navbar, contenido (`<Outlet/>`), footer y toasts. */
export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <a href={`#${MAIN_CONTENT_ID}`} className="visually-hidden-focusable btn btn-primary m-2">
        Saltar al contenido
      </a>

      <header className="navbar bg-body-tertiary border-bottom">
        <nav className="container-xl" aria-label="Principal">
          <Link to="/users" className="navbar-brand d-flex align-items-center gap-2 fw-semibold">
            <UsersRound size={22} className="text-primary" />
            UserPosts
          </Link>
        </nav>
      </header>

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="container-xl py-4 flex-grow-1">
        <Outlet />
      </main>

      <footer className="border-top py-3">
        <div className="container-xl small text-body-secondary">
          Datos de{' '}
          <a href="https://jsonplaceholder.typicode.com" target="_blank" rel="noreferrer">
            JSONPlaceholder
          </a>
          . Las publicaciones creadas no se guardan en el servidor.
        </div>
      </footer>

      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
