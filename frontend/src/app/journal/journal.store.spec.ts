import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of } from 'rxjs';
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
});
