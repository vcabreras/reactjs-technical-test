import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Button } from '../Button/Button';
import { Input } from './Input';

describe('Input', () => {
  it('asocia el label al input', () => {
    render(<Input label="Título" />);

    expect(screen.getByLabelText('Título')).toBeInstanceOf(HTMLInputElement);
  });

  it('muestra el error, marca aria-invalid y lo enlaza vía aria-describedby', () => {
    render(<Input label="Título" error="El título es obligatorio." />);

    const input = screen.getByLabelText('Título');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('El título es obligatorio.');
  });

  it('sin error no marca aria-invalid ni añade descripción', () => {
    render(<Input label="Título" />);

    const input = screen.getByLabelText('Título');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('combina error, hint, contador y el aria-describedby propio en la descripción', () => {
    render(
      <>
        <p id="extra">Extra</p>
        <Input
          label="Título"
          error="Demasiado largo."
          hint="Máximo 100 caracteres."
          characterCount={{ current: 120, max: 100 }}
          aria-describedby="extra"
        />
      </>,
    );

    expect(screen.getByLabelText('Título')).toHaveAccessibleDescription(
      'Demasiado largo. Máximo 100 caracteres. 120 de 100 caracteres Extra',
    );
  });

  it('con hideLabel mantiene el nombre accesible', () => {
    render(<Input label="Buscar" hideLabel />);

    expect(screen.getByRole('textbox', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('respeta un id explícito y reenvía ref y props nativas', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" id="email" ref={ref} type="email" required />);

    const input = screen.getByLabelText(/Email/);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
  });

  it('funciona con register() de React Hook Form + Zod', async () => {
    const schema = z.object({ title: z.string().trim().min(1, { error: 'Obligatorio.' }) });
    const onValid = vi.fn();

    function TestForm() {
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm({ resolver: zodResolver(schema) });

      return (
        <form onSubmit={handleSubmit(onValid)} noValidate>
          <Input label="Título" error={errors.title?.message} {...register('title')} />
          <Button type="submit">Enviar</Button>
        </form>
      );
    }

    render(<TestForm />);
    const input = screen.getByLabelText('Título');

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(input).toHaveAccessibleDescription('Obligatorio.');
    expect(input).toHaveFocus();
    expect(onValid).not.toHaveBeenCalled();

    await userEvent.type(input, '  Hola ');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onValid).toHaveBeenCalledWith({ title: 'Hola' }, expect.anything());
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
