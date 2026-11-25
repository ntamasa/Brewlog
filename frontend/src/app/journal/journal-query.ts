import { ParamMap, Params } from '@angular/router';
import { BrewQuery, DEFAULT_QUERY } from '../core/models';

export function queryFromParams(params: ParamMap): BrewQuery {
  const raw = params.get('page');
  const page = raw !== null && /^-?\d+$/.test(raw) ? Number(raw) : 1;
  return { ...DEFAULT_QUERY, page };
}

export function queryToParams(query: BrewQuery): Params {
  return query.page === 1 ? {} : { page: query.page };
}
