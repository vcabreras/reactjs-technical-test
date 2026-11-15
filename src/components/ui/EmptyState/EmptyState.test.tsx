import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('se anuncia como status con título y descripción', () => {
    render(<EmptyState title="Sin resultados" description="Prueba con otro nombre." />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Sin resultados');
    expect(status).toHaveTextContent('Prueba con otro nombre.');
  });

  it('renderiza la acción', () => {
    render(<EmptyState title="Sin resultados" action={<Button>Limpiar búsqueda</Button>} />);

    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
  });
});
