import { escapeRegExp } from '@/lib/escapeRegExp';
import { request } from './client';
import { type User, UserSchema } from './schemas';

export interface UserListParams {
  search?: string;
}

/**
 * Listado de usuarios con búsqueda server side, ordenado por nombre en el servidor.
 * La búsqueda usa `name_like` (solo nombre, parcial, sin distinguir mayúsculas; regex en servidor).
 */
export function getUsers({ search }: UserListParams, signal?: AbortSignal): Promise<User[]> {
  const term = search?.trim();

  return request('/users', {
    schema: UserSchema.array(),
    signal,
    query: {
      name_like: term ? escapeRegExp(term) : undefined,
      _sort: 'name',
      _order: 'asc',
    },
  });
}

/** Lanza `ApiError` con `status: 404` si el usuario no existe. */
export function getUserById(id: number, signal?: AbortSignal): Promise<User> {
  return request(`/users/${id}`, { schema: UserSchema, signal });
}
