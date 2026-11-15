import { Outlet, useMatch } from 'react-router';
import { SplitView } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { UsersListPanel } from './UsersListPanel';

/**
 * Maestro-detalle de `/users`: listado a la izquierda y detalle (`<Outlet/>`) a la derecha.
 * En móvil se ve un panel u otro según la URL.
 */
export function UsersPage() {
  const detailMatch = useMatch('/users/:userId');
  const selectedUserId = detailMatch?.params.userId;

  return (
    <>
      {/* El detalle define su propio título; aquí solo cuando no hay usuario seleccionado. */}
      {!selectedUserId && <title>Usuarios · UserPosts</title>}
      <SplitView
        activePanel={selectedUserId ? 'main' : 'aside'}
        aside={<UsersListPanel selectedUserId={selectedUserId} />}
        main={<Outlet />}
      />
    </>
  );
}

/** Panel de detalle cuando no hay usuario seleccionado (solo visible en escritorio). */
export function SelectUserHint() {
  return (
    <div className="card shadow-sm">
      <EmptyState
        title="Selecciona un usuario"
        description="Elige un usuario de la lista para ver sus publicaciones."
      />
    </div>
  );
}
