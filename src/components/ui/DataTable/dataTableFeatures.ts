import {
  createColumnHelper,
  metaHelper,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table';

export interface DataTableColumnMeta {
  /**
   * Clases para `<th>` y `<td>` de la columna. Con `mobileLayout="cards"` (por defecto),
   * para ocultar una columna solo en la tabla de tablet usar `d-md-none d-lg-table-cell`.
   */
  className?: string;
  /** Etiqueta en modo cards si `header` no es un string. */
  label?: string;
  /** En modo cards, la celda se muestra como título de la card (sin etiqueta). */
  cardTitle?: boolean;
}

/**
 * Registro de features de TanStack Table v9 para `DataTable`. Sin row models de cliente:
 * ordenación y paginación son siempre server side (`manualSorting` / `manualPagination`).
 * Las columnas deben crearse con `createDataTableColumnHelper` para compartir este tipo.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}
