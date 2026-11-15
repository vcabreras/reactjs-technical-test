import { useSearchParams } from 'react-router';
import { z } from 'zod';
import type { SortOrder } from '@/api/types';

export interface ListSearchParamsConfig<TSortField extends string> {
  sortFields: readonly [TSortField, ...TSortField[]];
  defaultSort: TSortField;
  defaultOrder: SortOrder;
  pageSizes: readonly [number, ...number[]];
  defaultPageSize: number;
}

export interface ListSearchState<TSortField extends string> {
  search: string;
  /** 1-based. */
  page: number;
  limit: number;
  sort: TSortField;
  order: SortOrder;
}

/**
 * Lee el estado del listado de la URL (`?q=&page=&limit=&sort=&order=`) validándolo con Zod:
 * cualquier valor inválido (editado a mano) se normaliza a su valor por defecto.
 */
export function parseListSearchParams<TSortField extends string>(
  searchParams: URLSearchParams,
  config: ListSearchParamsConfig<TSortField>,
): ListSearchState<TSortField> {
  const get = (key: string) => searchParams.get(key) ?? undefined;

  return {
    search: searchParams.get('q') ?? '',
    page: z.coerce.number().int().min(1).catch(1).parse(get('page')),
    limit: z.coerce
      .number()
      .refine((value) => config.pageSizes.includes(value))
      .catch(config.defaultPageSize)
      .parse(get('limit')),
    sort: z.enum(config.sortFields).catch(config.defaultSort).parse(get('sort')),
    order: z.enum(['asc', 'desc']).catch(config.defaultOrder).parse(get('order')),
  };
}

type ParamKey = 'q' | 'page' | 'limit' | 'sort' | 'order';

/**
 * Estado de un listado server side persistido en la URL (fuente de verdad única).
 * Los valores por defecto no se escriben en la URL. Cambiar búsqueda, tamaño u orden vuelve
 * a la página 1. Escribir en el buscador reemplaza la entrada del historial en lugar de apilar.
 */
export function useListSearchParams<TSortField extends string>(
  config: ListSearchParamsConfig<TSortField>,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseListSearchParams(searchParams, config);

  const update = (changes: Partial<Record<ParamKey, string>>, replace = false) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '') next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace },
    );
  };

  return {
    ...state,
    setSearch: (search: string) => update({ q: search, page: undefined }, true),
    setPage: (page: number) => update({ page: page > 1 ? String(page) : undefined }),
    setPageSize: (limit: number) =>
      update({
        limit: limit === config.defaultPageSize ? undefined : String(limit),
        page: undefined,
      }),
    setSorting: (sort: TSortField, order: SortOrder) =>
      update({
        sort: sort === config.defaultSort ? undefined : sort,
        order: order === config.defaultOrder ? undefined : order,
        page: undefined,
      }),
  };
}
