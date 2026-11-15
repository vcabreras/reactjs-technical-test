import { describe, expect, it } from 'vitest';
import { getPageItems } from './getPageItems';

describe('getPageItems', () => {
  it('muestra todas las páginas si caben', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('elipsis al final cerca del inicio', () => {
    expect(getPageItems(2, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
  });

  it('elipsis al inicio cerca del final', () => {
    expect(getPageItems(9, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('elipsis a ambos lados en medio, con longitud constante', () => {
    expect(getPageItems(5, 10)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]);
  });

  it('respeta siblingCount', () => {
    expect(getPageItems(10, 20, 2)).toEqual([
      1,
      'start-ellipsis',
      8,
      9,
      10,
      11,
      12,
      'end-ellipsis',
      20,
    ]);
  });

  it('acota una página fuera de rango', () => {
    expect(getPageItems(99, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });
});
