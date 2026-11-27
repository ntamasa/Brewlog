import { ParamMap, Params } from '@angular/router';
import { BrewQuery, DEFAULT_QUERY } from '../core/models';

export function queryFromParams(params: ParamMap): BrewQuery {
  const raw = params.get('page');
  const page = raw !== null && /^-?\d+$/.test(raw) ? Number(raw) : 1;
  return { ...DEFAULT_QUERY, q: params.get('q') ?? '', page };
}

export function queryToParams(query: BrewQuery): Params {
  const params: Params = {};
  const q = query.q.trim();
  if (q !== '') {
    params['q'] = q;
  }
  if (query.page !== 1) {
    params['page'] = query.page;
  }
  return params;
}
