import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, SkeletonGroup } from './Skeleton';

describe('SkeletonGroup', () => {
  it('anuncia la carga con su etiqueta y oculta las barras a tecnologías de asistencia', () => {
    render(
      <SkeletonGroup label="Cargando usuarios…">
        <Skeleton width={6} />
        <Skeleton width={4} size="sm" />
      </SkeletonGroup>,
    );

    const status = screen.getByRole('status');
    // Las barras no aportan texto: lo único que se anuncia es la etiqueta.
    expect(status).toHaveTextContent(/^Cargando usuarios…$/);
    // Las barras son solo visuales (aria-hidden): no tienen rol accesible por el que consultarlas.
    expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
