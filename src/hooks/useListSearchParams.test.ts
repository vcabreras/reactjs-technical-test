import { describe, expect, it } from 'vitest';
import { type ListSearchParamsConfig, parseListSearchParams } from './useListSearchParams';

const config: ListSearchParamsConfig<'name' | 'email'> = {
  sortFields: ['name', 'email'],
  defaultSort: 'name',
  defaultOrder: 'asc',
  pageSizes: [5, 10],
  defaultPageSize: 5,
};

const parse = (query: string) => parseListSearchParams(new URLSearchParams(query), config);

describe('parseListSearchParams', () => {
  it('usa los valores por defecto sin params', () => {
    expect(parse('')).toEqual({ search: '', page: 1, limit: 5, sort: 'name', order: 'asc' });
  });

  it('lee params válidos', () => {
    expect(parse('q=lea&page=3&limit=10&sort=email&order=desc')).toEqual({
      search: 'lea',
      page: 3,
      limit: 10,
      sort: 'email',
      order: 'desc',
    });
  });

  it('normaliza params inválidos a sus valores por defecto', () => {
    expect(parse('page=abc&limit=7&sort=password&order=random')).toEqual({
      search: '',
      page: 1,
      limit: 5,
      sort: 'name',
      order: 'asc',
    });
    expect(parse('page=0').page).toBe(1);
    expect(parse('page=-2').page).toBe(1);
    expect(parse('page=1.5').page).toBe(1);
  });
});
