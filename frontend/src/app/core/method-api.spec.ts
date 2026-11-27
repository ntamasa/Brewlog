import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MethodApi } from './method-api';
import { BrewMethod } from './models';

const AEROPRESS: BrewMethod = {
  id: 4,
  name: 'AeroPress',
  iconKey: 'aeropress',
  predefined: true,
  protected: false,
  position: 4,
  brewCount: 0,
};

describe('MethodApi.list', () => {
  let api: MethodApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(MethodApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a GET to /api/methods and emits the methods', () => {
    let result: BrewMethod[] | undefined;
    api.list().subscribe((methods) => (result = methods));

    const req = http.expectOne('/api/methods');
    expect(req.request.method).toBe('GET');
    req.flush([AEROPRESS]);

    expect(result).toEqual([AEROPRESS]);
  });
});
