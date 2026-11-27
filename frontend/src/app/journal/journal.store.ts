import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';
import { BrewApi } from '../core/brew-api';
import { Brew, BrewQuery, DEFAULT_QUERY } from '../core/models';

interface JournalState {
  query: BrewQuery;
  items: Brew[];
  page: number;
  totalPages: number;
  matchingCount: number;
  totalCount: number;
  status: 'loading' | 'ready' | 'error';
  highlightId: number | null;
}

export const JournalStore = signalStore(
  { providedIn: 'root' },
  withState<JournalState>({
    query: DEFAULT_QUERY,
    items: [],
    page: 1,
    totalPages: 0,
    matchingCount: 0,
    totalCount: 0,
    status: 'ready',
    highlightId: null,
  }),
  withMethods((store) => {
    const api = inject(BrewApi);

    const load = rxMethod<BrewQuery>(
      pipe(
        tap((query) => patchState(store, { query, status: 'loading' })),
        switchMap((query) =>
          api.list(query).pipe(
            tap((result) =>
              patchState(store, {
                items: result.items,
                page: result.page,
                totalPages: result.totalPages,
                matchingCount: result.matchingCount,
                totalCount: result.totalCount,
                status: 'ready',
              }),
            ),
            catchError(() => {
              patchState(store, { status: 'error' });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      highlight(id: number): void {
        patchState(store, { highlightId: id });
        setTimeout(() => patchState(store, { highlightId: null }), 1200);
      },
      setQuery(query: BrewQuery): void {
        load(query);
      },
      setPage(page: number): void {
        load({ ...store.query(), page });
      },
      reload(): void {
        load(store.query());
      },
    };
  }),
);
