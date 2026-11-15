export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/**
 * Páginas a mostrar con elipsis: siempre primera y última, `siblingCount` vecinas a cada lado
 * de la actual, y una longitud constante para que la paginación no "salte" al navegar.
 *
 * getPageItems(5, 10) → [1, '…', 4, 5, 6, '…', 10]
 */
export function getPageItems(page: number, pageCount: number, siblingCount = 1): PageItem[] {
  // primera + última + actual + vecinas + 2 elipsis
  const maxItems = siblingCount * 2 + 5;

  if (pageCount <= maxItems) {
    return range(1, pageCount);
  }

  const current = Math.min(Math.max(page, 1), pageCount);
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, pageCount);
  const showStartEllipsis = leftSibling > 2;
  const showEndEllipsis = rightSibling < pageCount - 1;
  const edgeLength = siblingCount * 2 + 3;

  if (!showStartEllipsis) {
    return [...range(1, edgeLength), 'end-ellipsis', pageCount];
  }

  if (!showEndEllipsis) {
    return [1, 'start-ellipsis', ...range(pageCount - edgeLength + 1, pageCount)];
  }

  return [1, 'start-ellipsis', ...range(leftSibling, rightSibling), 'end-ellipsis', pageCount];
}
