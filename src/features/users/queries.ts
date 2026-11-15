import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getUserById, getUsers, type UserListParams } from '@/api/users';

/** Fábrica de query keys de usuarios: única fuente de las claves de caché. */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

const USERS_STALE_TIME_MS = 60_000;

/** Listado server side: búsqueda, página y orden forman parte de la key. */
export function usersListQueryOptions(params: UserListParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => getUsers(params, signal),
    placeholderData: keepPreviousData,
    staleTime: USERS_STALE_TIME_MS,
  });
}

/** Detalle independiente del listado (deep link / usuario fuera de la página visible). */
export function userDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => getUserById(id, signal),
    staleTime: USERS_STALE_TIME_MS,
  });
}
