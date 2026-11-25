import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { registerIcons } from '../../core/icons';
import { Brew, BrewPage } from '../../core/models';
import { JournalPage } from './journal-page';

function brewAt(n: number): Brew {
  return {
    id: n,
    name: `Brew ${n}`,
    beanName: 'AA Kiambu',
    origin: 'Kenya',
    method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
    roast: 'MEDIUM',
    rating: 3,
    brewDate: '2026-10-28',
    notes: null,
  };
}

function page(first: number, count: number, pageNumber: number): BrewPage {
  return {
    items: Array.from({ length: count }, (_, i) => brewAt(first + i)),
    page: pageNumber,
    totalPages: 4,
    matchingCount: 41,
    totalCount: 41,
  };
}

function cardNames(element: HTMLElement): string[] {
  return Array.from(element.querySelectorAll('app-brew-card h3')).map((h) => h.textContent.trim());
}

function buttonWithText(element: HTMLElement, text: string): HTMLButtonElement {
  const found = Array.from<HTMLButtonElement>(element.querySelectorAll('button')).find(
    (b) => b.textContent.trim() === text,
  );
  if (!found) {
    throw new Error(`no button "${text}"`);
  }
  return found;
}

describe('JournalPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppInitializer(registerIcons),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('shows the count, twelve cards in order, the footer and the page numbers for page 1', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(page(1, 12, 1));
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(element.textContent).toContain('41 brews');
    expect(cardNames(element)).toEqual(Array.from({ length: 12 }, (_, i) => `Brew ${i + 1}`));
    expect(element.textContent).toContain('Showing 1–12 of 41');
    for (const label of ['1', '2', '3', '4']) {
      expect(buttonWithText(element, label)).toBeTruthy();
    }
    expect(buttonWithText(element, '‹').disabled).toBe(true);
  });

  it('loads the clicked page and shows the last five brews with their footer', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(page(1, 12, 1));
    await harness.fixture.whenStable();

    buttonWithText(harness.fixture.nativeElement, '4').click();
    http.expectOne('/api/brews?sort=NEWEST&page=4').flush(page(37, 5, 4));
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/journal?page=4');
    expect(harness.fixture.nativeElement.textContent).toContain('Showing 37–41 of 41');
  });

  it('requests the page given in the URL on open', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal?page=2', JournalPage);

    http.expectOne('/api/brews?sort=NEWEST&page=2');
  });
});
