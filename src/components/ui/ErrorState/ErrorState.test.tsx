import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('se anuncia como alert con título y mensaje', () => {
    render(<ErrorState message="El servidor no está disponible." />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('No se pudieron cargar los datos');
    expect(alert).toHaveTextContent('El servidor no está disponible.');
  });

  it('el botón reintentar llama a onRetry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('sin onRetry no muestra el botón', () => {
    render(<ErrorState message="Error" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('mientras reintenta deshabilita el botón', () => {
    render(<ErrorState message="Error" onRetry={vi.fn()} isRetrying />);

    expect(screen.getByRole('button', { name: 'Reintentando…' })).toBeDisabled();
  });
});
