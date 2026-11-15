import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, type PaginationProps } from './Pagination';

function renderPagination(props: Partial<PaginationProps> = {}) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <Pagination
      page={1}
      pageCount={4}
      total={18}
      pageSize={5}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      {...props}
    />,
  );
  return { onPageChange, onPageSizeChange };
}

describe('Pagination', () => {
  it('es una navegación etiquetada que marca la página actual con aria-current', () => {
    renderPagination({ page: 2 });

    const nav = screen.getByRole('navigation', { name: 'Paginación' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Página 1' })).not.toHaveAttribute('aria-current');
  });

  it('deshabilita "anterior" en la primera página y "siguiente" en la última', () => {
    const { unmount } = render(<Pagination page={1} pageCount={4} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
    unmount();

    render(<Pagination page={4} pageCount={4} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('notifica el cambio de página con siguiente, anterior y número', async () => {
    const { onPageChange } = renderPagination({ page: 2 });

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Página 4' }));

    expect(onPageChange.mock.calls).toEqual([[3], [1], [4]]);
  });

  it('no notifica al pulsar la página actual', async () => {
    const { onPageChange } = renderPagination({ page: 2 });

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('muestra el resumen del rango y la posición para móvil', () => {
    renderPagination({ page: 4 });

    expect(screen.getByText('Mostrando 16–18 de 18')).toBeInTheDocument();
    expect(screen.getByText('Página 4 de 4')).toBeInTheDocument();
  });

  it('notifica el cambio de tamaño de página como número', async () => {
    const { onPageSizeChange } = renderPagination();

    await userEvent.selectOptions(screen.getByLabelText('Por página'), '10');

    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });

  it('con una sola página oculta la navegación pero mantiene resumen y selector', () => {
    renderPagination({ pageCount: 1, total: 3 });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–3 de 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Por página')).toBeInTheDocument();
  });

  it('sin resultados no renderiza nada', () => {
    const { container } = render(
      <Pagination page={1} pageCount={0} total={0} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
