import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { cx } from '@/lib/cx';
import { getPageItems } from './getPageItems';

export interface PaginationProps {
  /** Página actual, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total de elementos: muestra "Mostrando X–Y de Z". */
  total?: number;
  pageSize?: number;
  /** Con `onPageSizeChange`, muestra el selector de tamaño de página. */
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (pageSize: number) => void;
  siblingCount?: number;
  /** Nombre accesible del `<nav>`. */
  label?: string;
  className?: string;
}

interface PageButtonProps {
  label: string;
  disabled?: boolean;
  current?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

function PageButton({ label, disabled, current, onClick, className, children }: PageButtonProps) {
  return (
    <li className={cx('page-item', disabled && 'disabled', current && 'active', className)}>
      <button
        type="button"
        className="page-link d-flex align-items-center h-100"
        aria-label={label}
        aria-current={current ? 'page' : undefined}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

/** Paginación controlada (server side). En móvil: solo anterior/siguiente + "Página X de Y". */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions = [5, 10],
  onPageSizeChange,
  siblingCount = 1,
  label = 'Paginación',
  className,
}: PaginationProps) {
  const pageSizeId = useId();

  if (total === 0 || pageCount < 1) {
    return null;
  }

  const goTo = (target: number) => {
    if (target !== page && target >= 1 && target <= pageCount) {
      onPageChange(target);
    }
  };

  const showSummary = total !== undefined && pageSize !== undefined;
  const from = showSummary ? (page - 1) * pageSize + 1 : 0;
  const to = showSummary ? Math.min(page * pageSize, total) : 0;

  return (
    <div
      className={cx('d-flex flex-wrap align-items-center justify-content-between gap-2', className)}
    >
      {showSummary && (
        <p className="small text-body-secondary mb-0" aria-live="polite">
          Mostrando {from}–{to} de {total}
        </p>
      )}

      <div className="d-flex flex-wrap align-items-center gap-3 ms-auto">
        {onPageSizeChange && pageSize !== undefined && (
          <div className="d-flex align-items-center gap-2">
            <label htmlFor={pageSizeId} className="small text-body-secondary text-nowrap">
              Por página
            </label>
            <select
              id={pageSizeId}
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label={label}>
            <ul className="pagination pagination-sm mb-0">
              <PageButton
                label="Página anterior"
                disabled={page <= 1}
                onClick={() => goTo(page - 1)}
              >
                <ChevronLeft size={16} />
              </PageButton>

              {getPageItems(page, pageCount, siblingCount).map((item) =>
                typeof item === 'number' ? (
                  <PageButton
                    key={item}
                    label={`Página ${item}`}
                    current={item === page}
                    onClick={() => goTo(item)}
                    className="d-none d-sm-block"
                  >
                    {item}
                  </PageButton>
                ) : (
                  <li
                    key={item}
                    className="page-item disabled d-none d-sm-block"
                    aria-hidden="true"
                  >
                    <span className="page-link">…</span>
                  </li>
                ),
              )}

              <li className="page-item disabled d-sm-none">
                <span className="page-link text-nowrap">
                  Página {page} de {pageCount}
                </span>
              </li>

              <PageButton
                label="Página siguiente"
                disabled={page >= pageCount}
                onClick={() => goTo(page + 1)}
              >
                <ChevronRight size={16} />
              </PageButton>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
