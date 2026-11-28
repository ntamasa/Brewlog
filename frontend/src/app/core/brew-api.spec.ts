import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BrewApi } from './brew-api';
import { Brew, BrewPage, DEFAULT_QUERY } from './models';

const EMPTY_PAGE: BrewPage = { items: [], page: 1, totalPages: 0, matchingCount: 0, totalCount: 0 };

describe('BrewApi.list', () => {
  let api: BrewApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BrewApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a GET with sort and page for the default query and emits the body', () => {
    let result: BrewPage | undefined;
    api.list(DEFAULT_QUERY).subscribe((page) => (result = page));

    const req = http.expectOne('/api/brews?sort=NEWEST&page=1');
    expect(req.request.method).toBe('GET');
    req.flush(EMPTY_PAGE);

    expect(result).toEqual(EMPTY_PAGE);
  });

  it('sends the trimmed search and every set filter, sort and page', () => {
    api
      .list({
        ...DEFAULT_QUERY,
        q: '  kenya ',
        methodId: 2,
        roast: 'LIGHT',
        minRating: 4,
        sort: 'HIGHEST',
        page: 2,
      })
      .subscribe();

    http
      .expectOne('/api/brews?q=kenya&methodId=2&roast=LIGHT&minRating=4&sort=HIGHEST&page=2')
      .flush(EMPTY_PAGE);
  });

  it('sends no q parameter when the search is only spaces', () => {
    api.list({ ...DEFAULT_QUERY, q: '   ' }).subscribe();

    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(EMPTY_PAGE);
  });
});

describe('BrewApi.create', () => {
  let api: BrewApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BrewApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the body as given to POST /api/brews and emits the created brew', () => {
    const body = {
      name: 'Kenyan Morning',
      beanName: 'AA Kiambu',
      origin: 'Kenya',
      methodId: 2,
      roast: 'LIGHT' as const,
      rating: 5,
      brewDate: '2026-11-01',
      notes: null,
    };
    const created: Brew = {
      id: 7,
      name: 'Kenyan Morning',
      beanName: 'AA Kiambu',
      origin: 'Kenya',
      method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
      roast: 'LIGHT',
      rating: 5,
      brewDate: '2026-11-01',
      notes: null,
    };
    let result: Brew | undefined;
    api.create(body).subscribe((brew) => (result = brew));

    const req = http.expectOne('/api/brews');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(created, { status: 201, statusText: 'Created' });

    expect(result).toEqual(created);
  });
});

describe('BrewApi.patch', () => {
  let api: BrewApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BrewApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends only the given fields as a PATCH to /api/brews/{id} and emits the brew', () => {
    const patched: Brew = {
      id: 7,
      name: 'Kenyan Morning',
      beanName: 'AA Kiambu',
      origin: 'Kenya',
      method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
      roast: 'LIGHT',
      rating: 4,
      brewDate: '2026-11-01',
      notes: null,
    };
    let result: Brew | undefined;
    api.patch(7, { rating: 4 }).subscribe((brew) => (result = brew));

    const req = http.expectOne('/api/brews/7');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rating: 4 });
    req.flush(patched);

    expect(result).toEqual(patched);
  });
});
