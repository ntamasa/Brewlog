import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, debounceTime, filter, pipe, switchMap, tap } from 'rxjs';
import { BrewApi } from '../core/brew-api';
import { Brew, BrewQuery, DEFAULT_QUERY, SortKey } from '../core/models';
import { FilterKey, isFiltered } from './journal-query';

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
  withComputed(({ query }) => ({
    isFiltered: computed(() => isFiltered(query())),
  })),
  withMethods((store) => {
    const api = inject(BrewApi);
    let highlightTimer: ReturnType<typeof setTimeout> | undefined;

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

    const search = rxMethod<string>(
      pipe(
        debounceTime(250),
        filter((text) => text !== store.query().q),
        tap((text) => load({ ...store.query(), q: text, page: 1 })),
      ),
    );

    return {
      setSearch: search,
      highlight(id: number): void {
        clearTimeout(highlightTimer);
        patchState(store, { highlightId: id });
        highlightTimer = setTimeout(() => patchState(store, { highlightId: null }), 1200);
      },
      setQuery(query: BrewQuery): void {
        load(query);
      },
      setSort(sort: SortKey): void {
        load({ ...store.query(), sort, page: 1 });
      },
      clearFilters(): void {
        load({ ...DEFAULT_QUERY, sort: store.query().sort });
      },
      removeFilter(key: FilterKey): void {
        load({ ...store.query(), [key]: DEFAULT_QUERY[key], page: 1 });
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
