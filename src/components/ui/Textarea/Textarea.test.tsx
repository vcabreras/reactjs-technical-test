import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('asocia el label y usa 4 filas por defecto', () => {
    render(<Textarea label="Texto" />);

    const textarea = screen.getByRole('textbox', { name: 'Texto' });
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('muestra el error y el contador en la descripción accesible', () => {
    render(
      <Textarea
        label="Texto"
        error="El texto es obligatorio."
        characterCount={{ current: 0, max: 500 }}
      />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Texto' });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('El texto es obligatorio. 0 de 500 caracteres');
  });

  it('reenvía ref y props nativas', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Texto" ref={ref} rows={8} maxLength={500} />);

    const textarea = screen.getByRole('textbox', { name: 'Texto' });
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute('rows', '8');
    expect(textarea).toHaveAttribute('maxLength', '500');
  });
});
