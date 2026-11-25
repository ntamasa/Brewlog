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

function must(element: HTMLElement, selector: string): HTMLElement {
  const found = element.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element "${selector}"`);
  }
  return found;
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

  it('shows six skeleton cards in a busy grid, with a skeleton count and no footer, while the first page loads', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    const grid = must(element, 'section.brew-grid');
    expect(grid.getAttribute('aria-busy')).toBe('true');
    expect(grid.getAttribute('aria-label')).toBe('Loading brews');
    const cards = element.querySelectorAll('.skel-card');
    expect(cards).toHaveLength(6);
    for (const card of Array.from(cards)) {
      expect(card.getAttribute('aria-hidden')).toBe('true');
      expect(card.querySelectorAll('.skeleton')).toHaveLength(8);
    }
    expect(element.querySelectorAll('app-brew-card')).toHaveLength(0);
    const count = must(element, 'p.count');
    expect(count.querySelectorAll('.skeleton')).toHaveLength(1);
    expect(count.textContent.trim()).toBe('');
    expect(element.querySelector('.list-foot')).toBeNull();
    expect(element.querySelector('app-pagination')).toBeNull();
    expect(element.textContent).not.toContain('Showing');
  });

  it('shows the load error panel with its message when the request fails with status 0', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').error(new ProgressEvent('error'));
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    const alert = must(element, '[role="alert"]');
    expect(alert.textContent).toContain('We couldn’t load your brews');
    expect(alert.textContent).toContain(
      'The Brewlog server didn’t respond. Check that the backend is running, then try again. Your entries are safe.',
    );
    const count = must(element, 'p.count');
    expect(count.textContent.trim()).toBe('');
    expect(count.querySelector('.skeleton')).toBeNull();
    expect(element.querySelector('.skel-card')).toBeNull();
    expect(element.querySelector('.brew-grid')).toBeNull();
    expect(element.querySelector('.list-foot')).toBeNull();
  });

  it('reloads the list when Try again is clicked, then shows the first page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http
      .expectOne('/api/brews?sort=NEWEST&page=1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    buttonWithText(element, 'Try again').click();
    await harness.fixture.whenStable();
    const retry = http.expectOne('/api/brews?sort=NEWEST&page=1');
    expect(element.querySelectorAll('.skel-card')).toHaveLength(6);
    expect(element.querySelector('[role="alert"]')).toBeNull();

    retry.flush(page(1, 12, 1));
    await harness.fixture.whenStable();

    expect(element.querySelectorAll('app-brew-card')).toHaveLength(12);
    expect(element.textContent).toContain('41 brews');
    expect(element.textContent).toContain('Showing 1–12 of 41');
    expect(element.querySelector('.skel-card')).toBeNull();
    expect(element.querySelector('[aria-busy]')).toBeNull();
  });

  it('shows skeleton cards and no footer while a clicked page loads', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(page(1, 12, 1));
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    buttonWithText(element, '4').click();
    await harness.fixture.whenStable();
    http.expectOne('/api/brews?sort=NEWEST&page=4');

    expect(element.querySelectorAll('.skel-card')).toHaveLength(6);
    expect(element.querySelectorAll('app-brew-card')).toHaveLength(0);
    expect(element.querySelector('.list-foot')).toBeNull();
    const count = must(element, 'p.count');
    expect(count.querySelectorAll('.skeleton')).toHaveLength(1);
    expect(count.textContent.trim()).toBe('');
  });

  it('shows the error panel with no cards and no footer when the first request answers 500', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http
      .expectOne('/api/brews?sort=NEWEST&page=1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelectorAll('app-brew-card')).toHaveLength(0);
    expect(element.querySelector('.list-foot')).toBeNull();
    expect(must(element, 'p.count').textContent.trim()).toBe('');
  });

  it('shows the error panel again and no skeleton cards when Try again is answered 500 again', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http
      .expectOne('/api/brews?sort=NEWEST&page=1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    buttonWithText(element, 'Try again').click();
    await harness.fixture.whenStable();
    http
      .expectOne('/api/brews?sort=NEWEST&page=1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('.skel-card')).toBeNull();
    expect(must(element, 'p.count').textContent.trim()).toBe('');
  });
});
