import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableProps } from './DataTable';
import { createDataTableColumnHelper } from './dataTableFeatures';

interface Person {
  id: number;
  name: string;
  email: string;
}

const helper = createDataTableColumnHelper<Person>();
const columns = helper.columns([
  helper.accessor('name', { header: 'Nombre', meta: { cardTitle: true } }),
  helper.accessor('email', { header: 'Email', meta: { className: 'd-md-none d-lg-table-cell' } }),
  helper.display({ id: 'actions', header: 'Acciones', cell: () => 'Ver' }),
]);

const people: Person[] = [
  { id: 1, name: 'Leanne Graham', email: 'leanne@example.com' },
  { id: 2, name: 'Ervin Howell', email: 'ervin@example.com' },
];

function renderTable(props: Partial<DataTableProps<Person>> = {}) {
  const handlers = {
    onSortingChange: vi.fn(),
    onPaginationChange: vi.fn(),
  };
  render(
    <DataTable
      data={people}
      columns={columns}
      getRowId={(person) => String(person.id)}
      caption="Usuarios"
      rowCount={12}
      pagination={{ pageIndex: 0, pageSize: 5 }}
      sorting={[{ id: 'name', desc: false }]}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

/** Filas de datos (excluye la fila de cabecera). */
function getBodyRows() {
  const [, ...bodyRows] = screen.getAllByRole('row');
  return bodyRows;
}

function getBodyRow(index: number): HTMLElement {
  const row = getBodyRows()[index];
  if (!row) throw new Error(`No existe la fila de datos ${index}`);
  return row;
}

describe('DataTable', () => {
  it('renderiza una tabla con nombre accesible, cabeceras y filas', () => {
    renderTable();

    expect(screen.getByRole('table', { name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Nombre',
      'Email',
      'Acciones',
    ]);
    expect(getBodyRows()).toHaveLength(2);
    expect(within(getBodyRow(0)).getByRole('cell', { name: 'Leanne Graham' })).toBeVisible();
  });

  it('aplica meta.className a cabecera y celdas (oculta en tablet, visible en cards y desktop)', () => {
    renderTable();

    expect(screen.getByRole('columnheader', { name: 'Email' })).toHaveClass('d-md-none');
    expect(screen.getByRole('cell', { name: 'leanne@example.com' })).toHaveClass('d-md-none');
  });

  it('por defecto usa el modo cards en móvil y mantiene la semántica de tabla', () => {
    renderTable();

    const table = screen.getByRole('table');
    expect(table).toHaveClass('data-table--cards');
    // Roles explícitos: el CSS de cards cambia el display y no debe romper la semántica.
    expect(table).toHaveAttribute('role', 'table');
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('en modo cards cada celda lleva su etiqueta y la columna cardTitle hace de título', () => {
    renderTable();

    const emailCell = screen.getByRole('cell', { name: 'leanne@example.com' });
    const nameCell = screen.getByRole('cell', { name: 'Leanne Graham' });
    expect(emailCell).toHaveAttribute('data-label', 'Email');
    expect(nameCell).toHaveAttribute('data-card-title', 'true');
    expect(emailCell).not.toHaveAttribute('data-card-title');
  });

  it('con mobileLayout="scroll" no aplica el modo cards', () => {
    renderTable({ mobileLayout: 'scroll' });

    expect(screen.getByRole('table')).not.toHaveClass('data-table--cards');
  });

  it('marca las cabeceras ordenables para mostrarlas como chips en móvil', () => {
    renderTable();

    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toHaveAttribute('data-sortable');
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).not.toHaveAttribute(
      'data-sortable',
    );
  });

  it('marca con aria-sort solo la columna ordenada', () => {
    renderTable({ sorting: [{ id: 'name', desc: true }] });

    expect(screen.getByRole('columnheader', { name: /Nombre/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(screen.getByRole('columnheader', { name: /Email/ })).not.toHaveAttribute('aria-sort');
  });

  it('notifica el nuevo orden al pulsar una cabecera (server side, sin reordenar en cliente)', async () => {
    const { onSortingChange } = renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'name', desc: true }]);

    await userEvent.click(screen.getByRole('button', { name: 'Email' }));
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'email', desc: false }]);

    // manualSorting: el orden de las filas es el que llega del servidor.
    expect(within(getBodyRow(0)).getByText('Leanne Graham')).toBeInTheDocument();
  });

  it('las columnas display no son ordenables', () => {
    renderTable();

    expect(screen.queryByRole('button', { name: 'Acciones' })).not.toBeInTheDocument();
  });

  it('notifica cambios de página y de tamaño con el estado de TanStack (0-based)', async () => {
    const { onPaginationChange } = renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 });

    await userEvent.selectOptions(screen.getByLabelText('Por página'), '10');
    expect(onPaginationChange).toHaveBeenLastCalledWith(expect.objectContaining({ pageSize: 10 }));
  });

  it('calcula las páginas a partir de rowCount', () => {
    renderTable();

    expect(screen.getByText('Mostrando 1–5 de 12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Página 4' })).not.toBeInTheDocument();
  });

  it('en la carga inicial anuncia la carga y muestra skeletons en lugar de filas', () => {
    renderTable({ data: [], rowCount: 0, isLoading: true, loadingLabel: 'Cargando usuarios…' });

    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…');
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No hay resultados')).not.toBeInTheDocument();
  });

  it('durante un refetch mantiene las filas visibles y marca aria-busy', () => {
    renderTable({ isFetching: true });

    expect(getBodyRows()).toHaveLength(2);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });

  it('sin filas muestra el estado vacío con su acción', () => {
    renderTable({
      data: [],
      rowCount: 0,
      emptyTitle: 'Sin resultados para "zzz"',
      emptyAction: <button type="button">Limpiar búsqueda</button>,
    });

    expect(screen.getByRole('status')).toHaveTextContent('Sin resultados para "zzz"');
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('con error sustituye la tabla por un ErrorState con reintento', async () => {
    const onRetry = vi.fn();
    renderTable({ errorMessage: 'El servidor no está disponible.', onRetry });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('El servidor no está disponible.');

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('con onRowClick las filas se activan con click, Enter y Espacio', async () => {
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    const firstRow = getBodyRow(0);
    const secondRow = getBodyRow(1);

    await userEvent.click(firstRow);
    secondRow.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(onRowClick.mock.calls).toEqual([[people[0]], [people[1]], [people[1]]]);
  });

  it('marca la fila seleccionada con aria-current', () => {
    renderTable({ onRowClick: vi.fn(), selectedRowId: '2' });
    const firstRow = getBodyRow(0);
    const secondRow = getBodyRow(1);

    expect(secondRow).toHaveAttribute('aria-current', 'true');
    expect(firstRow).not.toHaveAttribute('aria-current');
  });

  it('sin onRowClick las filas no son enfocables', () => {
    renderTable();

    expect(getBodyRow(0)).not.toHaveAttribute('tabindex');
  });
});
