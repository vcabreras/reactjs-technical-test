import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

function DrawerHarness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Drawer open={open} onClose={close} title="Nueva publicación" description="Para Leanne">
        <input aria-label="Título" />
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('cerrado no muestra su contenido', () => {
    render(<DrawerHarness />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
  });

  it('abierto es un diálogo con nombre y descripción accesibles', async () => {
    render(<DrawerHarness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    const dialog = screen.getByRole('dialog', { name: 'Nueva publicación' });
    expect(dialog).toHaveAccessibleDescription('Para Leanne');
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
  });

  it('se cierra con el botón cerrar', async () => {
    const onClose = vi.fn();
    render(<DrawerHarness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se cierra con Escape (evento cancel del <dialog>)', async () => {
    const onClose = vi.fn();
    render(<DrawerHarness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('se cierra al pulsar el backdrop pero no al pulsar dentro', async () => {
    const onClose = vi.fn();
    render(<DrawerHarness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    await userEvent.click(screen.getByLabelText('Título'));
    expect(onClose).not.toHaveBeenCalled();

    // El backdrop de un <dialog> modal recibe el click con el propio dialog como target.
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
