import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { BrewApi } from '../core/brew-api';
import { Brew, BrewPage, BrewQuery, DEFAULT_QUERY } from '../core/models';
import { JournalStore } from './journal.store';

function brew(id: number): Brew {
  return {
    id,
    name: `Brew ${id}`,
    beanName: 'AA Kiambu',
    origin: 'Kenya',
    method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
    roast: 'MEDIUM',
    rating: 3,
    brewDate: '2026-10-28',
    notes: null,
  };
}

const FIRST_PAGE: BrewPage = {
  items: Array.from({ length: 12 }, (_, i) => brew(i + 1)),
  page: 1,
  totalPages: 4,
  matchingCount: 41,
  totalCount: 41,
};

describe('JournalStore', () => {
  let list: (query: BrewQuery) => Observable<BrewPage>;
  let store: InstanceType<typeof JournalStore>;

  function setUp(answer: () => Observable<BrewPage>): void {
    list = vi.fn(answer);
    TestBed.configureTestingModule({ providers: [{ provide: BrewApi, useValue: { list } }] });
    store = TestBed.inject(JournalStore);
  }

  it('shows loading, then the loaded page with its counts', () => {
    const answer = new Subject<BrewPage>();
    setUp(() => answer);

    store.setQuery(DEFAULT_QUERY);
    expect(store.status()).toBe('loading');

    answer.next(FIRST_PAGE);
    expect(store.status()).toBe('ready');
    expect(store.items()).toHaveLength(12);
    expect(store.page()).toBe(1);
    expect(store.totalPages()).toBe(4);
    expect(store.matchingCount()).toBe(41);
    expect(store.totalCount()).toBe(41);
  });

  it('loads the requested page and keeps it in the query', () => {
    setUp(() => of(FIRST_PAGE));
    store.setQuery(DEFAULT_QUERY);

    store.setPage(3);

    expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, page: 3 });
    expect(store.query().page).toBe(3);
  });

  it('sets the status to error and keeps the query when the list request fails', () => {
    setUp(() => throwError(() => new HttpErrorResponse({ status: 503 })));

    store.setQuery(DEFAULT_QUERY);

    expect(store.status()).toBe('error');
    expect(store.query()).toEqual(DEFAULT_QUERY);
  });

  it('reloads the same query after an error and shows the loaded page', () => {
    let fail = true;
    setUp(() => (fail ? throwError(() => new HttpErrorResponse({ status: 503 })) : of(FIRST_PAGE)));
    store.setQuery(DEFAULT_QUERY);

    fail = false;
    store.reload();

    expect(store.status()).toBe('ready');
    expect(store.items()).toHaveLength(12);
  });

  describe('highlight', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      setUp(() => of(FIRST_PAGE));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('highlights the saved brew for 1.2 s, then clears it', () => {
      store.highlight(7);
      expect(store.highlightId()).toBe(7);

      vi.advanceTimersByTime(1199);
      expect(store.highlightId()).toBe(7);

      vi.advanceTimersByTime(1);
      expect(store.highlightId()).toBeNull();
    });

    it('keeps a later highlight for its full 1.2 s when an earlier highlight started 600 ms before', () => {
      store.highlight(7);
      vi.advanceTimersByTime(600);
      store.highlight(8);
      expect(store.highlightId()).toBe(8);

      vi.advanceTimersByTime(600);
      expect(store.highlightId()).toBe(8);

      vi.advanceTimersByTime(599);
      expect(store.highlightId()).toBe(8);

      vi.advanceTimersByTime(1);
      expect(store.highlightId()).toBeNull();
    });

    it('cancels the earlier highlight timer when a later highlight starts', () => {
      store.highlight(7);
      vi.advanceTimersByTime(600);
      store.highlight(8);
      expect(vi.getTimerCount()).toBe(1);

      vi.advanceTimersByTime(1200);
      expect(store.highlightId()).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps the same brew highlighted when it is highlighted again 600 ms later', () => {
      store.highlight(7);
      vi.advanceTimersByTime(600);
      store.highlight(7);

      vi.advanceTimersByTime(600);
      expect(store.highlightId()).toBe(7);

      vi.advanceTimersByTime(600);
      expect(store.highlightId()).toBeNull();
    });
  });

  describe('setSearch', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      setUp(() => of(FIRST_PAGE));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sends the search to the API after 250 ms, on page 1', () => {
      store.setQuery({ ...DEFAULT_QUERY, page: 3 });
      expect(list).toHaveBeenCalledTimes(1);

      store.setSearch('  kenya ');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(2);
      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, q: '  kenya ', page: 1 });
    });

    it('sends one request for the last of several searches typed within 250 ms', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('k');
      vi.advanceTimersByTime(100);
      store.setSearch('ke');
      vi.advanceTimersByTime(100);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(2);
      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, q: 'kenya', page: 1 });
    });

    it('sends nothing before 250 ms have passed', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('kenya');
      vi.advanceTimersByTime(249);

      expect(list).toHaveBeenCalledTimes(1);
    });

    it('is filtered only when the search is not blank after trimming', () => {
      store.setSearch('   ');
      vi.advanceTimersByTime(250);
      expect(store.isFiltered()).toBe(false);

      store.setSearch('kenya');
      vi.advanceTimersByTime(250);
      expect(store.isFiltered()).toBe(true);
    });

    it('sends the same search again after clearFilters', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);
      expect(list).toHaveBeenCalledTimes(2);

      store.clearFilters();
      expect(list).toHaveBeenCalledTimes(3);

      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(4);
      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, q: 'kenya', page: 1 });
      expect(store.isFiltered()).toBe(true);
    });

    it('sends the same search again after removeFilter("q")', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);
      expect(list).toHaveBeenCalledTimes(2);

      store.removeFilter('q');
      expect(list).toHaveBeenCalledTimes(3);

      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(4);
      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, q: 'kenya', page: 1 });
    });

    it('sends the same search again after the query is set back to the journal', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);
      expect(list).toHaveBeenCalledTimes(2);

      store.setQuery(DEFAULT_QUERY);
      expect(list).toHaveBeenCalledTimes(3);

      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(4);
      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, q: 'kenya', page: 1 });
      expect(store.isFiltered()).toBe(true);
    });

    it('does not send the same search again while it is still the current query', () => {
      store.setQuery(DEFAULT_QUERY);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);
      expect(list).toHaveBeenCalledTimes(2);

      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(2);
    });

    it('does not send a search equal to the current query, even after a typed change was debounced away', () => {
      store.setQuery({ ...DEFAULT_QUERY, q: 'kenya', page: 2 });
      expect(list).toHaveBeenCalledTimes(1);

      store.setSearch('kenyan');
      vi.advanceTimersByTime(100);
      store.setSearch('kenya');
      vi.advanceTimersByTime(250);

      expect(list).toHaveBeenCalledTimes(1);
      expect(store.query()).toEqual({ ...DEFAULT_QUERY, q: 'kenya', page: 2 });
    });
  });

  describe('clearFilters and removeFilter', () => {
    beforeEach(() => {
      setUp(() => of(FIRST_PAGE));
    });

    it('clearFilters keeps the sort, resets the search and filters, and goes to page 1', () => {
      store.setQuery({ ...DEFAULT_QUERY, q: 'kenya', sort: 'OLDEST', page: 3 });

      store.clearFilters();

      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, sort: 'OLDEST' });
      expect(store.query()).toEqual({ ...DEFAULT_QUERY, sort: 'OLDEST' });
    });

    it('removeFilter("q") clears the search and goes to page 1', () => {
      store.setQuery({ ...DEFAULT_QUERY, q: 'kenya', page: 3 });

      store.removeFilter('q');

      expect(list).toHaveBeenLastCalledWith(DEFAULT_QUERY);
      expect(store.isFiltered()).toBe(false);
    });

    it('removeFilter("q") keeps the sort and the other filters', () => {
      store.setQuery({ ...DEFAULT_QUERY, q: 'kenya', sort: 'HIGHEST', page: 2 });

      store.removeFilter('q');

      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, sort: 'HIGHEST' });
    });
  });

  describe('setSort', () => {
    beforeEach(() => {
      setUp(() => of(FIRST_PAGE));
    });

    it('loads page 1 with the new sort when the sort changes on page 3', () => {
      store.setQuery({ ...DEFAULT_QUERY, sort: 'OLDEST', page: 3 });

      store.setSort('HIGHEST');

      expect(list).toHaveBeenLastCalledWith({ ...DEFAULT_QUERY, sort: 'HIGHEST', page: 1 });
      expect(store.query().page).toBe(1);
      expect(store.query().sort).toBe('HIGHEST');
    });

    it('keeps the search and filters when the sort changes', () => {
      store.setQuery({
        ...DEFAULT_QUERY,
        q: 'kenya',
        roast: 'LIGHT',
        minRating: 4,
        sort: 'OLDEST',
        page: 3,
      });

      store.setSort('HIGHEST');

      const expected: BrewQuery = {
        ...DEFAULT_QUERY,
        q: 'kenya',
        roast: 'LIGHT',
        minRating: 4,
        sort: 'HIGHEST',
        page: 1,
      };
      expect(list).toHaveBeenLastCalledWith(expected);
      expect(store.query()).toEqual(expected);
    });
  });
});
