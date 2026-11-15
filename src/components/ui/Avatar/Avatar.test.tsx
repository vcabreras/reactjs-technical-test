import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';
import { getInitials } from './getInitials';

describe('getInitials', () => {
  it.each([
    ['Leanne Graham', 'LG'],
    ['Mrs. Dennis Schulist', 'MD'],
    ['  clementine   bauch ', 'CB'],
    ['Cher', 'C'],
  ])('%s → %s', (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});

describe('Avatar', () => {
  it('muestra las iniciales y queda oculto para tecnologías de asistencia', () => {
    const { container } = render(<Avatar name="Leanne Graham" />);

    // Decorativo (aria-hidden): no tiene rol accesible por el que consultarlo.
    const avatar = container.firstElementChild;
    expect(avatar).toHaveTextContent('LG');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
  });
});
