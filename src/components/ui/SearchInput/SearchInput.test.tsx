import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput, type SearchInputProps } from './SearchInput';

function ControlledSearch(props: Partial<SearchInputProps>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <SearchInput
      label="Buscar por nombre"
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange?.(next);
      }}
    />
  );
}

describe('SearchInput', () => {
  it('es un searchbox con nombre accesible aunque el label esté oculto', () => {
    render(<ControlledSearch />);

    expect(screen.getByRole('searchbox', { name: 'Buscar por nombre' })).toBeInTheDocument();
  });

  it('notifica cada cambio de valor', async () => {
    const onValueChange = vi.fn();
    render(<ControlledSearch onValueChange={onValueChange} />);

    await userEvent.type(screen.getByRole('searchbox'), 'lea');

    expect(onValueChange).toHaveBeenLastCalledWith('lea');
    expect(screen.getByRole('searchbox')).toHaveValue('lea');
  });

  it('muestra el botón limpiar solo con valor; al pulsarlo vacía y devuelve el foco', async () => {
    render(<ControlledSearch />);
    const searchbox = screen.getByRole('searchbox');

    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();

    await userEvent.type(searchbox, 'lea');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(searchbox).toHaveValue('');
    expect(searchbox).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();
  });

  it('limpia con la tecla Escape', async () => {
    render(<ControlledSearch value="lea" />);

    await userEvent.type(screen.getByRole('searchbox'), '{Escape}');

    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('anuncia la búsqueda en curso con isSearching', () => {
    render(<ControlledSearch isSearching />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando…');
  });
});
