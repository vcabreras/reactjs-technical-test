import { Link, useLocation } from 'react-router';
import type { User } from '@/api/schemas';
import { Avatar, Skeleton, SkeletonGroup } from '@/components/ui';
import { cx } from '@/lib/cx';

interface UserListProps {
  users: User[];
  selectedUserId?: string;
  /** Refetch con datos previos visibles: se atenúa la lista sin vaciarla. */
  isFetching?: boolean;
}

/**
 * Lista de usuarios (misma vista en móvil y escritorio). Cada elemento es un enlace al detalle que
 * conserva los params del listado. Nombre accesible = nombre; descripción = @usuario.
 */
export function UserList({ users, selectedUserId, isFetching = false }: UserListProps) {
  const { search } = useLocation();

  return (
    <ul
      className={cx('list-group list-group-flush user-list', isFetching && 'user-list--fetching')}
      aria-label="Usuarios"
      aria-busy={isFetching || undefined}
    >
      {users.map((user) => {
        const isSelected = String(user.id) === selectedUserId;
        const nameId = `user-${user.id}-name`;
        const usernameId = `user-${user.id}-username`;

        return (
          <li key={user.id} className="list-group-item p-0 border-0">
            <Link
              to={{ pathname: `/users/${user.id}`, search }}
              className={cx(
                'list-group-item list-group-item-action d-flex align-items-center gap-3 py-3',
                isSelected && 'active',
              )}
              aria-current={isSelected ? 'page' : undefined}
              aria-labelledby={nameId}
              aria-describedby={usernameId}
            >
              <Avatar name={user.name} />
              <span className="min-w-0">
                <span id={nameId} className="d-block fw-semibold text-truncate">
                  {user.name}
                </span>
                <span id={usernameId} className="d-block small user-list__username text-truncate">
                  @{user.username}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function UserListSkeleton({ rows }: { rows: number }) {
  return (
    <SkeletonGroup label="Cargando usuarios…">
      <ul className="list-group list-group-flush" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="list-group-item d-flex align-items-center gap-3 py-3">
            <span className="avatar placeholder" />
            <span className="flex-grow-1">
              <Skeleton width={7} className="mb-1" />
              <Skeleton width={4} size="sm" />
            </span>
          </li>
        ))}
      </ul>
    </SkeletonGroup>
  );
}
