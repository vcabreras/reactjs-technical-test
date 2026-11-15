import { Outlet, useMatch } from 'react-router';
import { SplitView } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { UsersListPanel } from './UsersListPanel';

/**
 * Maestro-detalle de `/users`: listado (4/12) y detalle (`<Outlet/>`, 8/12). En escritorio ocupa
 * el alto disponible y cada panel hace scroll propio; en móvil se ve un panel u otro según la URL.
 */
export function UsersPage() {
  const detailMatch = useMatch('/users/:userId');
  const selectedUserId = detailMatch?.params.userId;

  return (
    <div className="fill-page">
      {/* El detalle define su propio título; aquí solo cuando no hay usuario seleccionado. */}
      {!selectedUserId && <title>Usuarios</title>}
      {/* Sin cabecera visible (la marca ya dice "Usuarios"), pero la página conserva su h1. */}
      <h1 className="visually-hidden">Usuarios</h1>
      <SplitView
        activePanel={selectedUserId ? 'main' : 'aside'}
        aside={<UsersListPanel selectedUserId={selectedUserId} />}
        main={<Outlet />}
      />
    </div>
  );
}

/** Panel de detalle cuando no hay usuario seleccionado (solo visible en escritorio). */
export function SelectUserHint() {
  return (
    <div className="card border-0 shadow-sm">
      <EmptyState
        title="Selecciona un usuario"
        description="Elige un usuario de la lista para ver sus publicaciones."
      />
    </div>
  );
}
