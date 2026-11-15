import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import { getErrorMessage } from '@/api/errors';
import type { User } from '@/api/schemas';
import { PageHeader } from '@/components/layout';
import { Button, DataTable, SearchInput } from '@/components/ui';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListSearchParams } from '@/hooks/useListSearchParams';
import { userColumns } from './columns';
import { usersListQueryOptions } from './queries';
import { isUserSortField, USERS_LIST_CONFIG } from './usersListConfig';

const SEARCH_DEBOUNCE_MS = 300;
/** Fallback estable: un `[]` nuevo en cada render invalidaría los row models de la tabla. */
const NO_USERS: User[] = [];

function getUserRowId(user: User): string {
  return String(user.id);
}

interface UsersListPanelProps {
  selectedUserId?: string;
}

/** Listado de usuarios: búsqueda, paginación y ordenación server side con estado en la URL. */
export function UsersListPanel({ selectedUserId }: UsersListPanelProps) {
  const navigate = useNavigate();
  const { search: locationSearch } = useLocation();
  const list = useListSearchParams(USERS_LIST_CONFIG);
  const debouncedSearch = useDebouncedValue(list.search.trim(), SEARCH_DEBOUNCE_MS);

  const usersQuery = useQuery(
    usersListQueryOptions({
      search: debouncedSearch,
      page: list.page,
      limit: list.limit,
      sort: list.sort,
      order: list.order,
    }),
  );

  const users = usersQuery.data?.data ?? NO_USERS;
  const total = usersQuery.data?.total ?? 0;
  const isTyping = list.search.trim() !== debouncedSearch;
  const isPageOutOfRange = total > 0 && users.length === 0 && list.page > 1;

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={usersQuery.data ? `${total} ${total === 1 ? 'usuario' : 'usuarios'}` : undefined}
      />

      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchInput
          label="Buscar usuarios por nombre"
          placeholder="Buscar por nombre…"
          value={list.search}
          onValueChange={list.setSearch}
          isSearching={isTyping || (usersQuery.isFetching && !usersQuery.isPending)}
        />
      </form>

      <DataTable
        caption="Usuarios"
        data={users}
        columns={userColumns}
        getRowId={getUserRowId}
        rowCount={total}
        pagination={{ pageIndex: list.page - 1, pageSize: list.limit }}
        onPaginationChange={({ pageIndex, pageSize }) => {
          if (pageSize !== list.limit) list.setPageSize(pageSize);
          else list.setPage(pageIndex + 1);
        }}
        pageSizeOptions={USERS_LIST_CONFIG.pageSizes}
        sorting={[{ id: list.sort, desc: list.order === 'desc' }]}
        onSortingChange={([next]) => {
          if (next && isUserSortField(next.id)) {
            list.setSorting(next.id, next.desc ? 'desc' : 'asc');
          }
        }}
        isLoading={usersQuery.isPending}
        isFetching={usersQuery.isFetching && !usersQuery.isPending}
        loadingLabel="Cargando usuarios…"
        errorMessage={usersQuery.isError ? getErrorMessage(usersQuery.error) : undefined}
        onRetry={() => void usersQuery.refetch()}
        isRetrying={usersQuery.isFetching}
        emptyTitle={
          isPageOutOfRange
            ? 'Esta página no existe'
            : debouncedSearch
              ? `No hay usuarios que coincidan con "${debouncedSearch}"`
              : 'No hay usuarios'
        }
        emptyAction={
          isPageOutOfRange ? (
            <Button variant="outline-primary" onClick={() => list.setPage(1)}>
              Ir a la primera página
            </Button>
          ) : debouncedSearch ? (
            <Button variant="outline-primary" onClick={() => list.setSearch('')}>
              Ver todos los usuarios
            </Button>
          ) : undefined
        }
        onRowClick={(user) =>
          void navigate({ pathname: `/users/${user.id}`, search: locationSearch })
        }
        selectedRowId={selectedUserId}
      />
    </div>
  );
}
