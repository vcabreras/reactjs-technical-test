import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { notify } from './notify';
import { Toaster } from './Toaster';

afterEach(() => {
  act(() => {
    notify.dismiss();
  });
});

describe('Toaster + notify', () => {
  it('muestra un toast de éxito dentro de la región de notificaciones', async () => {
    render(<Toaster />);

    act(() => {
      notify.success('Publicación creada', { description: 'Ya aparece en la lista.' });
    });

    const region = screen.getByRole('region', { name: /Notificaciones/ });
    expect(await within(region).findByText('Publicación creada')).toBeInTheDocument();
    expect(within(region).getByText('Ya aparece en la lista.')).toBeInTheDocument();
  });

  it('la región se anuncia de forma educada (aria-live="polite")', () => {
    render(<Toaster />);

    expect(screen.getByRole('region', { name: /Notificaciones/ })).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  it('muestra un toast de error que se puede cerrar', async () => {
    render(<Toaster />);

    act(() => {
      notify.error('No se pudo crear la publicación');
    });

    expect(await screen.findByText('No se pudo crear la publicación')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));

    await waitFor(() => {
      expect(screen.queryByText('No se pudo crear la publicación')).not.toBeInTheDocument();
    });
  });

  it('con el mismo id reemplaza el toast en lugar de apilar otro', async () => {
    render(<Toaster />);

    act(() => {
      notify.error('Error 1', { id: 'create-post' });
      notify.error('Error 2', { id: 'create-post' });
    });

    expect(await screen.findByText('Error 2')).toBeInTheDocument();
    expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
  });
});
