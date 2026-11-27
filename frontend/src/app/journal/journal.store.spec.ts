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
});
