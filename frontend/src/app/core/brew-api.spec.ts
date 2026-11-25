import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BrewApi } from './brew-api';
import { BrewPage, DEFAULT_QUERY } from './models';

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
