import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/api/errors';
import type { User } from '@/api/schemas';
import { Button, EmptyState, ErrorState, SearchInput } from '@/components/ui';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { usersListQueryOptions } from './queries';
import { UserList, UserListSkeleton } from './UserList';

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_ROWS = 6;
const NO_USERS: User[] = [];

interface UsersListPanelProps {
  selectedUserId?: string;
}

/**
 * Listado de usuarios con búsqueda server side (`?q=` en la URL, con debounce). Sin paginación:
 * en escritorio la lista ocupa el alto disponible y hace scroll propio.
 */
export function UsersListPanel({ selectedUserId }: UsersListPanelProps) {
  const [search, setSearch] = useSearchParamState('q');
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const usersQuery = useQuery(usersListQueryOptions({ search: debouncedSearch }));

  const users = usersQuery.data ?? NO_USERS;
  const isTyping = search.trim() !== debouncedSearch;
  const isRefetching = usersQuery.isFetching && !usersQuery.isPending;

  const renderContent = () => {
    if (usersQuery.isPending) {
      return <UserListSkeleton rows={SKELETON_ROWS} />;
    }

    if (usersQuery.isError) {
      return (
        <div className="p-3">
          <ErrorState
            message={getErrorMessage(usersQuery.error)}
            onRetry={() => void usersQuery.refetch()}
            isRetrying={usersQuery.isFetching}
          />
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <EmptyState
          title={
            debouncedSearch
              ? `No hay usuarios que coincidan con "${debouncedSearch}"`
              : 'No hay usuarios'
          }
          action={
            debouncedSearch && (
              <Button variant="outline-primary" onClick={() => setSearch('')}>
                Ver todos los usuarios
              </Button>
            )
          }
        />
      );
    }

    return <UserList users={users} selectedUserId={selectedUserId} isFetching={isRefetching} />;
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden fill-panel">
      {/* flex-grow-0: .card-body trae flex 1 1 auto y, con la card a toda altura, empujaría la lista al centro. */}
      <div className="card-body pb-2 flex-grow-0 flex-shrink-0">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <SearchInput
            label="Buscar usuarios por nombre"
            placeholder="Buscar usuario…"
            containerClassName="mb-0"
            value={search}
            onValueChange={setSearch}
            isSearching={isTyping || isRefetching}
          />
        </form>
      </div>

      {/* `key`: cada búsqueda monta la zona de scroll de nuevo y los resultados empiezan arriba. */}
      <div key={debouncedSearch} className="fill-panel__scroll">
        {renderContent()}
      </div>
    </div>
  );
}
