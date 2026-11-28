import { ParamMap, Params } from '@angular/router';
import { BrewQuery, DEFAULT_QUERY, SortKey } from '../core/models';

export type FilterKey = 'q' | 'methodId' | 'roast' | 'minRating';

const SORT_KEYS: readonly SortKey[] = ['NEWEST', 'OLDEST', 'HIGHEST', 'LOWEST'];

export function isFiltered(query: BrewQuery): boolean {
  return query.q.trim() !== '';
}

export function queryFromParams(params: ParamMap): BrewQuery {
  const raw = params.get('page');
  const page = raw !== null && /^-?\d+$/.test(raw) ? Number(raw) : 1;
  const sort = SORT_KEYS.find((key) => key === params.get('sort')) ?? DEFAULT_QUERY.sort;
  return { ...DEFAULT_QUERY, q: params.get('q') ?? '', sort, page };
}

export function queryToParams(query: BrewQuery): Params {
  const params: Params = {};
  const q = query.q.trim();
  if (q !== '') {
    params['q'] = q;
  }
  if (query.sort !== DEFAULT_QUERY.sort) {
    params['sort'] = query.sort;
  }
  if (query.page !== 1) {
    params['page'] = query.page;
  }
  return params;
}
