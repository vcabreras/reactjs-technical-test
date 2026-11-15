import { describe, expect, it } from 'vitest';
import { escapeRegExp } from './escapeRegExp';

describe('escapeRegExp', () => {
  it('escapa todos los metacaracteres de regex', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('deja intacto el texto normal', () => {
    expect(escapeRegExp('Leanne Graham')).toBe('Leanne Graham');
  });

  it('produce una regex que coincide solo con el texto literal', () => {
    const pattern = new RegExp(escapeRegExp('mrs. d'), 'i');
    expect(pattern.test('Mrs. Dennis')).toBe(true);
    expect(pattern.test('Mrsx Dennis')).toBe(false);
  });
});
