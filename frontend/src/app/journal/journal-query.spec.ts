import { convertToParamMap } from '@angular/router';
import { DEFAULT_QUERY } from '../core/models';
import { queryFromParams, queryToParams } from './journal-query';

describe('queryFromParams', () => {
  it('reads page 2 from ?page=2', () => {
    expect(queryFromParams(convertToParamMap({ page: '2' })).page).toBe(2);
  });

  it('falls back to page 1 when page is not a number', () => {
    expect(queryFromParams(convertToParamMap({ page: 'abc' })).page).toBe(1);
  });

  it('gives page 1 when there are no params', () => {
    expect(queryFromParams(convertToParamMap({})).page).toBe(1);
  });

  it('reads the search from ?q=kenya', () => {
    expect(queryFromParams(convertToParamMap({ q: 'kenya' })).q).toBe('kenya');
  });
});

describe('queryToParams', () => {
  it('writes page 2 as the page param', () => {
    expect(queryToParams({ ...DEFAULT_QUERY, page: 2 })).toEqual({ page: 2 });
  });

  it('omits the page param for the default query', () => {
    expect(queryToParams(DEFAULT_QUERY)).toEqual({});
  });

  it('writes the search trimmed as the q param', () => {
    expect(queryToParams({ ...DEFAULT_QUERY, q: '  kenya ' })).toEqual({ q: 'kenya' });
  });

  it('omits the q param when the search is blank after trimming', () => {
    expect(queryToParams({ ...DEFAULT_QUERY, q: '   ' })).toEqual({});
  });
});
