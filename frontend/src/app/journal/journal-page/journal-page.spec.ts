import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MATERIAL_ANIMATIONS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MatSelectHarness } from '@angular/material/select/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { enGB } from 'date-fns/locale';
import { type Mock, vi } from 'vitest';
import { routes } from '../../app.routes';
import { BREWLOG_DATE_FORMATS } from '../../core/date-formats';
import { BREWLOG_FORM_FIELD_OPTIONS } from '../../core/form-field-options';
import { registerIcons } from '../../core/icons';
import { Brew, BrewMethod, BrewPage } from '../../core/models';
import { Toaster } from '../../core/toast';
import { JournalPage } from './journal-page';

const SAVED: Brew = {
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

const METHODS: BrewMethod[] = [
  {
    id: 2,
    name: 'Pour Over',
    iconKey: 'pour-over',
    predefined: true,
    protected: false,
    position: 2,
    brewCount: 0,
  },
  {
    id: 99,
    name: 'Other',
    iconKey: 'cup',
    predefined: true,
    protected: true,
    position: 99,
    brewCount: 0,
  },
];

function empty(): BrewPage {
  return { items: [], page: 1, totalPages: 0, matchingCount: 0, totalCount: 0 };
}

function threeBrews(): BrewPage {
  return {
    items: [brewAt(1), brewAt(2), brewAt(3)],
    page: 1,
    totalPages: 1,
    matchingCount: 3,
    totalCount: 3,
  };
}

async function expectFormClosed(page: HTMLElement): Promise<void> {
  await vi.waitFor(() => {
    expect(page.querySelector('mat-sidenav')!.classList.contains('mat-drawer-opened')).toBe(false);
    expect(page.querySelector('app-brew-form')).toBeNull();
  });
}

function showFab(page: HTMLElement): HTMLButtonElement {
  const fab = page.querySelector<HTMLButtonElement>('button[aria-label="Add brew"]');
  if (!fab) {
    throw new Error('no FAB "Add brew"');
  }
  expect(getComputedStyle(fab).display).toBe('none');
  fab.style.setProperty('display', 'inline-flex', 'important');
  return fab;
}

async function field(loader: HarnessLoader, selector: string): Promise<MatInputHarness> {
  return loader.getHarness(MatInputHarness.with({ selector }));
}

async function fillValid(loader: HarnessLoader, page: HTMLElement): Promise<void> {
  await (await field(loader, '#name')).setValue('Kenyan Morning');
  await (await field(loader, '#bean')).setValue('AA Kiambu');
  await (await field(loader, '#origin')).setValue('Kenya');
  await (
    await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
  ).clickOptions({ text: 'Pour Over' });
  await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
  page.querySelectorAll<HTMLInputElement>('.rating-input input[type="radio"]')[4].click();
}

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
  let toaster: { show: Mock };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppInitializer(registerIcons),
        provideDateFnsAdapter(BREWLOG_DATE_FORMATS),
        { provide: MAT_DATE_LOCALE, useValue: enGB },
        { provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } },
        { provide: Toaster, useValue: { show: vi.fn() } },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    toaster = TestBed.inject(Toaster) as unknown as { show: Mock };
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

  it('shows "No brews yet", the empty panel and its button when the journal has no brews', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(empty());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(must(element, 'p.count').textContent).toContain('No brews yet');
    expect(element.textContent).toContain('Your journal is waiting');
    expect(buttonWithText(element, 'Log your first brew')).toBeTruthy();
    expect(element.querySelector('app-brew-card')).toBeNull();
    expect(element.querySelector('.list-foot')).toBeNull();
    expect(element.querySelector('app-pagination')).toBeNull();
  });

  it('opens the brew form from "Log your first brew" and loads the methods', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(empty());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    buttonWithText(element, 'Log your first brew').click();
    await harness.fixture.whenStable();

    http.expectOne('/api/methods');
    expect(element.querySelector('app-brew-form h2')!.textContent).toContain('Log a brew');
  });

  it('saves a brew from the form: closes it, shows the toast, highlights the card and reloads the page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal?page=2', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=2').flush({
      items: [brewAt(13), brewAt(14)],
      page: 2,
      totalPages: 2,
      matchingCount: 14,
      totalCount: 14,
    });
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);

    buttonWithText(element, 'Add brew').click();
    await harness.fixture.whenStable();
    http.expectOne('/api/methods').flush(METHODS);
    await harness.fixture.whenStable();
    await fillValid(loader, element);
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }))).click();
    http.expectOne('/api/brews').flush(SAVED, { status: 201, statusText: 'Created' });
    await harness.fixture.whenStable();

    await expectFormClosed(element);
    expect(toaster.show).toHaveBeenCalledTimes(1);
    expect(toaster.show).toHaveBeenCalledWith('“Kenyan Morning” saved to your journal');
    http.expectOne('/api/brews?sort=NEWEST&page=2').flush({
      items: [SAVED, brewAt(8)],
      page: 2,
      totalPages: 2,
      matchingCount: 14,
      totalCount: 14,
    });
    await harness.fixture.whenStable();

    await vi.waitFor(() => {
      const highlighted = element.querySelectorAll('.brew-card-highlight');
      expect(highlighted).toHaveLength(1);
      expect(highlighted[0].querySelector('h3')!.textContent.trim()).toBe('Kenyan Morning');
    });
  });

  it('closes only the method listbox on Esc: the drawer stays open and the typed values are kept', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);

    buttonWithText(element, 'Add brew').click();
    await harness.fixture.whenStable();
    http.expectOne('/api/methods').flush(METHODS);
    await harness.fixture.whenStable();
    await (await field(loader, '#name')).setValue('Kenyan Morning');
    const select = await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }));
    await select.open();

    await (await select.host()).sendKeys(TestKey.ESCAPE);

    expect(await select.isOpen()).toBe(false);
    expect(element.querySelector('mat-sidenav')!.classList.contains('mat-drawer-opened')).toBe(
      true,
    );
    expect(element.querySelector('app-brew-form')).not.toBeNull();
    expect(await (await field(loader, '#name')).getValue()).toBe('Kenyan Morning');
    expect(await select.isEmpty()).toBe(true);
    http.expectNone((req) => req.url.startsWith('/api/'));
  });

  it('keeps the chosen method when Esc closes the listbox after an arrow key moved the active option', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);

    buttonWithText(element, 'Add brew').click();
    await harness.fixture.whenStable();
    http.expectOne('/api/methods').flush(METHODS);
    await harness.fixture.whenStable();
    const select = await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }));
    await select.clickOptions({ text: 'Pour Over' });
    await select.open();
    await (await select.host()).sendKeys(TestKey.DOWN_ARROW);

    await (await select.host()).sendKeys(TestKey.ESCAPE);

    expect(await select.isOpen()).toBe(false);
    expect(element.querySelector('mat-sidenav')!.classList.contains('mat-drawer-opened')).toBe(
      true,
    );
    expect(await select.getValueText()).toBe('Pour Over');
  });

  it('closes the form on Esc when the method select is focused and its listbox is closed', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);

    buttonWithText(element, 'Add brew').click();
    await harness.fixture.whenStable();
    http.expectOne('/api/methods').flush(METHODS);
    await harness.fixture.whenStable();
    const select = await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }));
    await select.focus();

    await (await select.host()).sendKeys(TestKey.ESCAPE);

    await expectFormClosed(element);
  });

  it('returns focus to "+ Add brew" when the form is cancelled, and focuses Brew name when it opens', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);
    const trigger = buttonWithText(element, 'Add brew');

    trigger.focus();
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Add brew' }))).click();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(element.querySelector('input[formcontrolname="name"]')),
    );

    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    await expectFormClosed(element);
  });

  it('opens the form from the FAB and returns focus to the FAB when it is closed without saving', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);
    const fab = showFab(element);

    fab.focus();
    await (
      await loader.getHarness(MatButtonHarness.with({ selector: '[aria-label="Add brew"]' }))
    ).click();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(element.querySelector('input[formcontrolname="name"]')),
    );

    await (
      await loader.getHarness(
        MatButtonHarness.with({ selector: '[aria-label="Close without saving"]' }),
      )
    ).click();
    await vi.waitFor(() => expect(document.activeElement).toBe(fab));
    await expectFormClosed(element);
  });

  it('returns focus to "+ Log your first brew" when the form is cancelled from the empty state', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(empty());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);
    const trigger = buttonWithText(element, 'Log your first brew');

    trigger.focus();
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Log your first brew' }))).click();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(element.querySelector('input[formcontrolname="name"]')),
    );

    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    await expectFormClosed(element);
  });

  it('does not show the empty state when the brews request fails', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http
      .expectOne('/api/brews?sort=NEWEST&page=1')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.textContent).not.toContain('Your journal is waiting');
    expect(element.textContent).not.toContain('No brews yet');
  });

  it('keeps focus on the FAB when the form opened from it is cancelled, and opens exactly one focus target', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/journal', JournalPage);
    http.expectOne('/api/brews?sort=NEWEST&page=1').flush(threeBrews());
    await harness.fixture.whenStable();
    const element: HTMLElement = harness.fixture.nativeElement;
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);
    const fab = showFab(element);

    fab.focus();
    await (
      await loader.getHarness(MatButtonHarness.with({ selector: '[aria-label="Add brew"]' }))
    ).click();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(element.querySelector('input[formcontrolname="name"]')),
    );
    const sidenav = element.querySelector('mat-sidenav')!;
    expect(sidenav.querySelectorAll('[cdkFocusInitial]')).toHaveLength(1);
    expect(sidenav.querySelector('[cdkFocusInitial]')).toBe(
      element.querySelector('input[formcontrolname="name"]'),
    );

    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    await expectFormClosed(element);
    await vi.waitFor(() => expect(document.activeElement).toBe(fab));
    expect(document.activeElement).not.toBe(buttonWithText(element, 'Add brew'));
    expect(document.activeElement).not.toBe(document.body);
  });
});
