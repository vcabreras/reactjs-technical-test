export type SortOrder = 'asc' | 'desc';

/** Estado de un listado server side: búsqueda, paginación y ordenación van siempre juntas. */
export interface ListParams<TSortField extends string> {
  search?: string;
  /** 1-based. */
  page: number;
  limit: number;
  sort?: TSortField;
  order?: SortOrder;
}

export interface Paginated<T> {
  data: T[];
  /** Total de elementos que cumplen el filtro (cabecera `X-Total-Count`). */
  total: number;
}
