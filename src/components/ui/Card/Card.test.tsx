import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { Card } from './Card';

describe('Card', () => {
  it('con título es una región etiquetada por su encabezado', () => {
    render(
      <Card title="Nueva publicación" headingLevel={3}>
        Contenido
      </Card>,
    );

    const region = screen.getByRole('region', { name: 'Nueva publicación' });
    expect(region).toHaveTextContent('Contenido');
    expect(
      screen.getByRole('heading', { level: 3, name: 'Nueva publicación' }),
    ).toBeInTheDocument();
  });

  it('sin título no crea una región', () => {
    render(<Card>Contenido</Card>);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('renderiza acciones y footer', () => {
    render(
      <Card title="Posts" actions={<Button>Nuevo</Button>} footer="Pie">
        Contenido
      </Card>,
    );

    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
    expect(screen.getByText('Pie')).toBeInTheDocument();
  });
});
