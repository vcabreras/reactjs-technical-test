import { escapeRegExp } from '@/lib/escapeRegExp';
import { request, requestPaginated } from './client';
import { type User, UserSchema } from './schemas';
import type { ListParams, Paginated } from './types';

export const USER_SORT_FIELDS = ['name', 'username', 'email'] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export type UserListParams = ListParams<UserSortField>;

/**
 * Listado de usuarios con búsqueda, paginación y ordenación server side.
 * La búsqueda usa `name_like` (solo nombre, parcial, sin distinguir mayúsculas; regex en servidor).
 */
export function getUsers(params: UserListParams, signal?: AbortSignal): Promise<Paginated<User>> {
  const search = params.search?.trim();

  return requestPaginated('/users', {
    itemSchema: UserSchema,
    signal,
    query: {
      name_like: search ? escapeRegExp(search) : undefined,
      _page: params.page,
      _limit: params.limit,
      _sort: params.sort,
      _order: params.sort ? params.order : undefined,
    },
  });
}

/** Lanza `ApiError` con `status: 404` si el usuario no existe. */
export function getUserById(id: number, signal?: AbortSignal): Promise<User> {
  return request(`/users/${id}`, { schema: UserSchema, signal });
}
