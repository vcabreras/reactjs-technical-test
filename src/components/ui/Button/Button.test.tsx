import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el contenido, es type="button" por defecto y responde al click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);

    const button = screen.getByRole('button', { name: 'Guardar' });
    await userEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-busy');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('con isLoading muestra el spinner junto al texto, se deshabilita y marca aria-busy', () => {
    const { container } = render(<Button isLoading>Publicar</Button>);

    const button = screen.getByRole('button', { name: 'Publicar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    // El spinner es solo visual (aria-hidden): no tiene rol accesible por el que consultarlo.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('con isLoading y loadingText sustituye el texto', () => {
    render(
      <Button isLoading loadingText="Publicando…">
        Publicar
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Publicando…' })).toBeInTheDocument();
  });

  it('impide el click mientras carga (evita doble envío)', async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Publicar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('no permite que las props reactiven un botón en carga', () => {
    render(
      <Button isLoading disabled={false}>
        Publicar
      </Button>,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('reenvía ref y props nativas', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} type="submit" aria-label="Enviar formulario" variant="outline-danger">
        Enviar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Enviar formulario' });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'submit');
  });
});
