import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('se anuncia como status con su etiqueta accesible', () => {
    render(<Spinner label="Cargando usuarios…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…');
  });

  it('usa una etiqueta por defecto', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });

  it('en modo decorativo queda oculto para tecnologías de asistencia', () => {
    render(<Spinner decorative />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
