import {
  type CellData,
  type ColumnDef,
  FlexRender,
  functionalUpdate,
  type PaginationState,
  type RowData,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { Pagination } from '../Pagination/Pagination';
import { Skeleton } from '../Skeleton/Skeleton';
import {
  type DataTableColumnMeta,
  dataTableFeatures,
  type DataTableFeatures,
} from './dataTableFeatures';

export interface DataTableProps<TData extends RowData> {
  /** Página ya procesada por el servidor (filtrada, ordenada y paginada). Referencia estable. */
  data: TData[];
  /** Definidas a nivel de módulo con `createDataTableColumnHelper` (referencia estable). */
  columns: ReadonlyArray<ColumnDef<DataTableFeatures, TData, CellData>>;
  getRowId: (row: TData) => string;
  /** Nombre accesible de la tabla (`<caption>` oculto visualmente). */
  caption: string;

  /** Total de filas en el servidor (`X-Total-Count`). */
  rowCount: number;
  /** `pageIndex` 0-based, como TanStack Table. */
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  pageSizeOptions?: readonly number[];
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;

  /** Carga inicial sin datos: muestra skeletons. */
  isLoading?: boolean;
  /** Refetch con datos previos visibles (p. ej. `keepPreviousData`). */
  isFetching?: boolean;
  loadingLabel?: string;
  /** Mensaje de error para el usuario: sustituye a la tabla por un `ErrorState`. */
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;

  /** Hace las filas activables con click, Enter y Espacio. */
  onRowClick?: (row: TData) => void;
  selectedRowId?: string;

  /**
   * `cards` (por defecto): por debajo de `md` cada fila se muestra como una card con etiquetas
   * y las cabeceras ordenables como chips. `scroll`: tabla con scroll horizontal interno.
   */
  mobileLayout?: 'cards' | 'scroll';
}

/** Etiqueta de la columna para el modo cards: `header` si es string, si no `meta.label`. */
function getColumnLabel(
  columnDef: { header?: unknown; meta?: DataTableColumnMeta },
  columnId: string,
): string {
  return typeof columnDef.header === 'string'
    ? columnDef.header
    : (columnDef.meta?.label ?? columnId);
}

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') return <ArrowUp size={14} />;
  if (direction === 'desc') return <ArrowDown size={14} />;
  return <ArrowUpDown size={14} className="opacity-50" />;
}

/**
 * Tabla genérica sobre TanStack Table v9 con ordenación y paginación server side.
 * El estado es controlado: quien la usa lo guarda (URL) y lo pasa a la query.
 */
export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  caption,
  rowCount,
  pagination,
  onPaginationChange,
  pageSizeOptions,
  sorting,
  onSortingChange,
  isLoading = false,
  isFetching = false,
  loadingLabel = 'Cargando…',
  errorMessage,
  onRetry,
  isRetrying,
  emptyTitle = 'No hay resultados',
  emptyDescription,
  emptyAction,
  onRowClick,
  selectedRowId,
  mobileLayout = 'cards',
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    rowCount,
    manualSorting: true,
    manualPagination: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
    state: { sorting, pagination },
    onSortingChange: (updater) => onSortingChange(functionalUpdate(updater, sorting)),
    onPaginationChange: (updater) => onPaginationChange(functionalUpdate(updater, pagination)),
  });

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={onRetry} isRetrying={isRetrying} />;
  }

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const showSkeleton = isLoading && rows.length === 0;

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {showSkeleton && (
        <span role="status" className="visually-hidden">
          {loadingLabel}
        </span>
      )}

      <div className="table-responsive">
        {/*
          Roles ARIA explícitos: en modo cards el CSS cambia el `display` de la tabla y algunos
          navegadores eliminan entonces la semántica de tabla del árbol de accesibilidad.
        */}
        <table
          role="table"
          className={cx(
            'table table-hover align-middle mb-0 data-table',
            mobileLayout === 'cards' && 'data-table--cards',
            isFetching && !showSkeleton && 'data-table--fetching',
          )}
          aria-busy={isLoading || isFetching || undefined}
        >
          <caption className="visually-hidden">{caption}</caption>
          <thead role="rowgroup">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  const sortDirection = column.getIsSorted();
                  const className = column.columnDef.meta?.className;

                  return (
                    <th
                      key={header.id}
                      role="columnheader"
                      scope="col"
                      className={cx('text-nowrap', className)}
                      data-sortable={column.getCanSort() || undefined}
                      aria-sort={
                        sortDirection === 'asc'
                          ? 'ascending'
                          : sortDirection === 'desc'
                            ? 'descending'
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : column.getCanSort() ? (
                        <button
                          type="button"
                          className="btn btn-link p-0 fw-semibold text-reset text-decoration-none d-inline-flex align-items-center gap-1"
                          onClick={column.getToggleSortingHandler()}
                        >
                          <FlexRender header={header} />
                          <SortIcon direction={sortDirection} />
                        </button>
                      ) : (
                        <FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody role="rowgroup">
            {showSkeleton &&
              Array.from({ length: pagination.pageSize }, (_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  role="row"
                  aria-hidden="true"
                  className="placeholder-glow"
                >
                  {table.getAllLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      role="cell"
                      className={column.columnDef.meta?.className}
                      data-label={getColumnLabel(column.columnDef, column.id)}
                      data-card-title={column.columnDef.meta?.cardTitle || undefined}
                    >
                      <Skeleton width={8} />
                    </td>
                  ))}
                </tr>
              ))}

            {!showSkeleton && rows.length === 0 && (
              <tr role="row">
                <td role="cell" colSpan={columnCount} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const isSelected = row.id === selectedRowId;

              return (
                <tr
                  key={row.id}
                  role="row"
                  className={cx(
                    onRowClick && 'data-table__row--clickable',
                    isSelected && 'table-active',
                  )}
                  aria-current={isSelected ? 'true' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={
                    onRowClick ? (event) => handleRowKeyDown(event, row.original) : undefined
                  }
                >
                  {row.getAllCells().map((cell) => {
                    const { columnDef } = cell.column;

                    return (
                      <td
                        key={cell.id}
                        role="cell"
                        className={columnDef.meta?.className}
                        data-label={getColumnLabel(columnDef, cell.column.id)}
                        data-card-title={columnDef.meta?.cardTitle || undefined}
                      >
                        <FlexRender cell={cell} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        total={rowCount}
        pageSize={pagination.pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
      />
    </div>
  );
}
