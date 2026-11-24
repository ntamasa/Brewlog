import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { LandingPage } from './landing/landing-page/landing-page';
import { JournalPage } from './journal/journal-page/journal-page';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('renders LandingPage at the root path', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/', LandingPage);
    expect(page).toBeInstanceOf(LandingPage);
  });

  it('renders JournalPage at /journal', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/journal', JournalPage);
    expect(page).toBeInstanceOf(JournalPage);
  });

  it('redirects an unknown path to the root and renders LandingPage', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/does-not-exist', LandingPage);
    expect(TestBed.inject(Router).url).toBe('/');
    expect(page).toBeInstanceOf(LandingPage);
  });
});
