import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { BackLink } from './BackLink/BackLink';
import { PageHeader } from './PageHeader/PageHeader';
import { SplitView } from './SplitView/SplitView';

describe('PageHeader', () => {
  it('renderiza título con el nivel indicado, subtítulo y acciones', () => {
    render(
      <PageHeader
        title="Leanne Graham"
        subtitle="@Bret"
        headingLevel={2}
        actions={<button type="button">Nueva</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Leanne Graham' })).toBeInTheDocument();
    expect(screen.getByText('@Bret')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nueva' })).toBeInTheDocument();
  });

  it('usa h1 por defecto', () => {
    render(<PageHeader title="Usuarios" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
  });
});

describe('SplitView', () => {
  // La visibilidad por breakpoint es CSS de Bootstrap (jsdom no lo aplica): se comprueban
  // las clases que la producen.
  it('en móvil oculta el panel inactivo; en escritorio muestra ambos', () => {
    render(<SplitView activePanel="main" aside={<p>Lista</p>} main={<p>Detalle</p>} />);

    const asideColumn = screen.getByText('Lista').parentElement;
    const mainColumn = screen.getByText('Detalle').closest('.col-12');

    expect(asideColumn).toHaveClass('d-none', 'd-lg-block');
    expect(mainColumn).not.toHaveClass('d-none');
  });
});

describe('BackLink', () => {
  it('enlaza al destino y solo se muestra en móvil por defecto', async () => {
    const router = createMemoryRouter(
      [{ path: '/users/1', element: <BackLink to="/users?q=lea" label="Volver a usuarios" /> }],
      { initialEntries: ['/users/1'] },
    );
    render(<RouterProvider router={router} />);

    const link = await screen.findByRole('link', { name: 'Volver a usuarios' });
    expect(link).toHaveAttribute('href', '/users?q=lea');
    expect(link).toHaveClass('d-lg-none');
  });
});
