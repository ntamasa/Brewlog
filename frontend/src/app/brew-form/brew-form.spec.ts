import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MatCalendarHarness,
  MatDatepickerInputHarness,
} from '@angular/material/datepicker/testing';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MatSelectHarness } from '@angular/material/select/testing';
import { enGB } from 'date-fns/locale';
import { type Mock, vi } from 'vitest';
import { BREWLOG_DATE_FORMATS } from '../core/date-formats';
import { Toaster } from '../core/toast';
import { BREWLOG_FORM_FIELD_OPTIONS } from '../core/form-field-options';
import { Brew, BrewMethod } from '../core/models';
import { BrewForm } from './brew-form';

function method(id: number, name: string, iconKey: string, isProtected = false): BrewMethod {
  return {
    id,
    name,
    iconKey,
    predefined: true,
    protected: isProtected,
    position: id,
    brewCount: 0,
  };
}

const METHODS: BrewMethod[] = [
  method(1, 'Espresso', 'espresso'),
  method(2, 'Pour Over', 'pour-over'),
  method(3, 'French Press', 'french-press'),
  method(4, 'AeroPress', 'aeropress'),
  method(5, 'Moka Pot', 'moka-pot'),
  method(6, 'Cold Brew', 'cold-brew'),
  method(99, 'Other', 'cup', true),
];

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

const VALID_BODY = {
  name: 'Kenyan Morning',
  beanName: 'AA Kiambu',
  origin: 'Kenya',
  methodId: 2,
  roast: 'LIGHT',
  rating: 5,
  brewDate: '2026-11-01',
  notes: null,
};

describe('BrewForm', () => {
  let fixture: ComponentFixture<BrewForm>;
  let form: BrewForm;
  let loader: HarnessLoader;
  let http: HttpTestingController;
  let toaster: { show: Mock };
  let saved: Mock;
  let closed: Mock;

  function mount(): void {
    fixture = TestBed.createComponent(BrewForm);
    fixture.componentRef.setInput('methods', METHODS);
    form = fixture.componentInstance;
    saved = vi.fn();
    closed = vi.fn();
    form.saved.subscribe((brew) => saved(brew));
    form.closed.subscribe(() => closed());
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }

  async function field(selector: string): Promise<MatInputHarness> {
    return loader.getHarness(MatInputHarness.with({ selector }));
  }

  function radios(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.rating-input input[type="radio"]'));
  }

  async function fieldOf(name: string): Promise<MatFormFieldHarness> {
    return loader.getHarness(MatFormFieldHarness.with({ ancestor: `[data-field="${name}"]` }));
  }

  function bannerEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.banner-error');
  }

  function bannerTitle(): string {
    return bannerEl()?.querySelector('strong')?.textContent?.trim() ?? '';
  }

  function bannerLinkTexts(): string[] {
    return Array.from(bannerEl()?.querySelectorAll('a') ?? []).map((link) =>
      (link.textContent ?? '').trim(),
    );
  }

  function dateInput(): Promise<MatDatepickerInputHarness> {
    return loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }));
  }

  async function addToJournal(): Promise<void> {
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }))).click();
  }

  async function fillValid(): Promise<void> {
    await (await field('#name')).setValue('Kenyan Morning');
    await (await field('#bean')).setValue('AA Kiambu');
    await (await field('#origin')).setValue('Kenya');
    await (
      await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
    ).clickOptions({ text: 'Pour Over' });
    await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
    radios()[4].click();
    fixture.detectChanges();
  }

  async function fillValidExcept(skipped: 'method' | 'roast' | 'rating' | 'date'): Promise<void> {
    await (await field('#name')).setValue('Kenyan Morning');
    await (await field('#bean')).setValue('AA Kiambu');
    await (await field('#origin')).setValue('Kenya');
    if (skipped !== 'method') {
      await (
        await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
      ).clickOptions({ text: 'Pour Over' });
    }
    if (skipped !== 'roast') {
      await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
    }
    if (skipped !== 'rating') {
      radios()[4].click();
    }
    fixture.detectChanges();
  }

  async function expectFormDisabled(disabled: boolean): Promise<void> {
    expect(await (await field('#name')).isDisabled()).toBe(disabled);
    expect(await (await field('#bean')).isDisabled()).toBe(disabled);
    expect(await (await field('#origin')).isDisabled()).toBe(disabled);
    expect(await (await field('#notes')).isDisabled()).toBe(disabled);
    expect(
      await (
        await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
      ).isDisabled(),
    ).toBe(disabled);
    expect(
      await (
        await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
      ).isDisabled(),
    ).toBe(disabled);
    for (const toggle of await loader.getAllHarnesses(MatButtonToggleHarness)) {
      expect(await toggle.isDisabled()).toBe(disabled);
    }
    expect(radios().length).toBe(5);
    for (const radio of radios()) {
      expect(radio.disabled).toBe(disabled);
    }
  }

  async function expectKeptAfterFailure(): Promise<void> {
    fixture.detectChanges();
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }));
    expect(await button.isDisabled()).toBe(false);
    expect(fixture.nativeElement.querySelector('button[aria-busy]')).toBeNull();
    const primary: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[matbutton="filled"]',
    );
    expect(primary.getAttribute('aria-disabled')).not.toBe('true');
    await expectFormDisabled(false);

    expect(await (await field('#name')).isDisabled()).toBe(false);
    expect(await (await field('#name')).getValue()).toBe('Kenyan Morning');
    expect(await (await field('#bean')).getValue()).toBe('AA Kiambu');
    expect(await (await field('#origin')).getValue()).toBe('Kenya');
    expect(
      await (
        await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
      ).getValueText(),
    ).toBe('Pour Over');
    expect(
      await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).isChecked(),
    ).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('5 of 5');
    expect(
      await (
        await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
      ).getValue(),
    ).toBe('1 Nov 2026');
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Log a brew');
    expect(saved).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
    expect(toaster.show).not.toHaveBeenCalled();
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 1, 9, 0));
    TestBed.configureTestingModule({
      imports: [BrewForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideDateFnsAdapter(BREWLOG_DATE_FORMATS),
        { provide: MAT_DATE_LOCALE, useValue: enGB },
        { provide: Toaster, useValue: { show: vi.fn() } },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    toaster = TestBed.inject(Toaster) as unknown as { show: Mock };
    mount();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  // Happy path

  it('labels Brew name, Bean name, Origin, Date and Tasting notes above their inputs', () => {
    const el: HTMLElement = fixture.nativeElement;
    const labels: [string, string][] = [
      ['name', 'Brew name'],
      ['bean', 'Bean name'],
      ['origin', 'Origin'],
      ['date', 'Date'],
    ];
    for (const [id, text] of labels) {
      const label = el.querySelector(`label.field-label[for="${id}"]`);
      expect(label?.textContent?.trim()).toBe(text);
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(el.querySelector('#name')?.tagName).toBe('INPUT');
    expect(el.querySelector('#bean')?.tagName).toBe('INPUT');
    expect(el.querySelector('#origin')?.tagName).toBe('INPUT');
    expect(el.querySelector('#date')?.tagName).toBe('INPUT');

    const notes = el.querySelector('label.field-label[for="notes"]');
    expect(notes?.textContent?.trim().startsWith('Tasting notes')).toBe(true);
    expect(notes?.querySelector('span.opt')?.textContent?.trim()).toBe('Optional');
    expect(el.querySelector('#notes')?.tagName).toBe('TEXTAREA');
  });

  it('builds every form field as an outlined field with no floating label or mat-label', async () => {
    const fields = await loader.getAllHarnesses(MatFormFieldHarness);
    expect(fields.length).toBeGreaterThan(0);
    for (const formField of fields) {
      expect(await formField.getAppearance()).toBe('outline');
      expect(await formField.hasLabel()).toBe(false);
    }
    expect(fixture.nativeElement.querySelector('mat-label')).toBeNull();
  });

  it('shows the name and date help text as hints, each marked as field-help', async () => {
    const name = await loader.getHarness(
      MatFormFieldHarness.with({ ancestor: '[data-field="name"]' }),
    );
    expect(await name.getTextHints()).toEqual([
      'A name only you would recognise, like “Sunday Moka”. Must be unique.',
    ]);
    const date = await loader.getHarness(
      MatFormFieldHarness.with({ ancestor: '[data-field="date"]' }),
    );
    expect(await date.getTextHints()).toEqual([
      'Defaults to today. Change it if you’re logging an earlier brew.',
    ]);
    const hints = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('mat-hint'));
    expect(hints.length).toBe(2);
    for (const hint of hints) {
      expect(hint.classList.contains('field-help')).toBe(true);
    }
  });

  it('groups Roast level and Rating as fieldsets with their legends, and Rating has the id rating', () => {
    const el: HTMLElement = fixture.nativeElement;
    const roast = el.querySelector('fieldset.field[data-field="roast"]');
    expect(roast?.querySelector('legend.field-label')?.textContent?.trim()).toBe('Roast level');
    const rating = el.querySelector('fieldset.field[data-field="rating"]#rating');
    expect(rating?.querySelector('legend.field-label')?.textContent?.trim()).toBe('Rating');
  });

  it('checks Light as the only roast with no checkmark in the roast group', async () => {
    await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
    fixture.detectChanges();

    expect(form.form.controls.roast.value).toBe('LIGHT');
    const toggles = await loader.getAllHarnesses(MatButtonToggleHarness);
    expect(await toggles[0].isChecked()).toBe(true);
    expect(await toggles[1].isChecked()).toBe(false);
    expect(await toggles[2].isChecked()).toBe(false);
    const group: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle-group');
    expect(group.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
    expect(group.querySelectorAll('.mat-button-toggle-checkbox-wrapper').length).toBe(0);
  });

  it('gives the roast group the segmented class, radiogroup role and Roast level label, with a swatch per toggle', () => {
    const group: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle-group');
    expect(group.classList.contains('segmented')).toBe(true);
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-label')).toBe('Roast level');

    const toggles = Array.from<HTMLElement>(group.querySelectorAll('mat-button-toggle'));
    expect(toggles.map((toggle) => toggle.textContent?.trim())).toEqual([
      'Light',
      'Medium',
      'Dark',
    ]);
    expect(toggles[0].querySelector('.swatch-light')).not.toBeNull();
    expect(toggles[1].querySelector('.swatch-medium')).not.toBeNull();
    expect(toggles[2].querySelector('.swatch-dark')).not.toBeNull();
  });

  it('shows no roast checked and no checkmark in the roast group before a choice is made', async () => {
    for (const toggle of await loader.getAllHarnesses(MatButtonToggleHarness)) {
      expect(await toggle.isChecked()).toBe(false);
    }
    const group: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle-group');
    expect(group.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
  });

  it('moves the roast from Light to Dark, unchecking Light and keeping the group without a checkmark', async () => {
    await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
    await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Dark' }))).check();
    fixture.detectChanges();

    expect(form.form.controls.roast.value).toBe('DARK');
    expect(
      await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).isChecked(),
    ).toBe(false);
    expect(
      await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Dark' }))).isChecked(),
    ).toBe(true);
    const group: HTMLElement = fixture.nativeElement.querySelector('mat-button-toggle-group');
    expect(group.querySelectorAll('.mat-pseudo-checkbox').length).toBe(0);
  });

  it('in create mode shows an empty form with the date defaulting to today', async () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Log a brew');
    expect(await (await field('#name')).getValue()).toBe('');
    expect(await (await field('#bean')).getValue()).toBe('');
    expect(await (await field('#origin')).getValue()).toBe('');
    expect(form.form.controls.notes.value).toBe('');
    expect(fixture.nativeElement.querySelector('textarea').value).toBe('');

    expect(form.form.controls.methodId.value).toBeNull();
    const method = await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }));
    expect(await method.isEmpty()).toBe(true);
    expect(await method.getValueText()).toBe('Choose a method');

    expect(form.form.controls.roast.value).toBeNull();
    for (const toggle of await loader.getAllHarnesses(MatButtonToggleHarness)) {
      expect(await toggle.isChecked()).toBe(false);
    }

    expect(form.form.controls.rating.value).toBeNull();
    expect(radios().some((radio) => radio.checked)).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Not rated');

    expect(
      await (
        await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
      ).getValue(),
    ).toBe('1 Nov 2026');
  });

  it('with the valid form, sends one POST and emits the saved brew once the server answers 201', async () => {
    await fillValid();
    await addToJournal();

    const request = http.expectOne('/api/brews');
    expect(request.request.body).toEqual(VALID_BODY);

    const busy = fixture.nativeElement.querySelector('button[aria-busy="true"]');
    expect(busy.textContent).toContain('Saving…');
    expect(await (await field('#name')).isDisabled()).toBe(true);
    expect(
      await (
        await loader.getHarness(MatSelectHarness.with({ selector: '#method-btn' }))
      ).isDisabled(),
    ).toBe(true);

    request.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    expect(saved).toHaveBeenCalledTimes(1);
    expect(saved).toHaveBeenCalledWith(SAVED);
  });

  it('after a 500 the same valid form sends the same body again, and a 201 emits saved once', async () => {
    await fillValid();
    await addToJournal();
    http.expectOne('/api/brews').flush({}, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    await addToJournal();
    const retry = http.expectOne('/api/brews');
    expect(retry.request.body).toEqual(VALID_BODY);
    retry.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    expect(saved).toHaveBeenCalledTimes(1);
    expect(saved).toHaveBeenCalledWith(SAVED);
  });

  it('while the POST is in flight the primary is busy: aria-busy and aria-disabled, no native disabled, Saving… with one spinner', async () => {
    await fillValid();
    await addToJournal();
    const request = http.expectOne('/api/brews');

    const busy: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-busy="true"]');
    expect(busy.getAttribute('aria-disabled')).toBe('true');
    expect(busy.hasAttribute('disabled')).toBe(false);
    expect(busy.classList.contains('mat-mdc-button-disabled')).toBe(true);
    expect(busy.textContent).toContain('Saving…');
    expect(busy.querySelectorAll('span.spinner[aria-hidden="true"]').length).toBe(1);
    expect(busy.querySelectorAll('span.spinner').length).toBe(1);

    request.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
  });

  it('while the POST is in flight every brew form field, the date and the roast and rating controls are disabled', async () => {
    await fillValid();
    await addToJournal();

    const request = http.expectOne('/api/brews');

    await expectFormDisabled(true);
    request.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
  });

  it('while the POST is in flight Cancel and the close button stay enabled, and Cancel emits closed once', async () => {
    await fillValid();
    await addToJournal();
    const request = http.expectOne('/api/brews');

    const cancel: HTMLButtonElement = fixture.nativeElement.querySelector(
      'footer.foot button.btn-secondary',
    );
    const close: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Close without saving"]',
    );
    for (const button of [cancel, close]) {
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('aria-disabled')).toBe(false);
    }

    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();
    expect(closed).toHaveBeenCalledTimes(1);

    request.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
  });

  // Negative

  it('opens the calendar with 2 Nov 2026 disabled and 1 Nov 2026 enabled', async () => {
    await (
      await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
    ).openCalendar();
    const calendar =
      await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatCalendarHarness);

    const [second] = await calendar.getCells({ text: '2' });
    const [first] = await calendar.getCells({ text: '1' });
    expect(await second.isDisabled()).toBe(true);
    expect(await first.isDisabled()).toBe(false);
  });

  it('Cancel emits closed and sends no request', async () => {
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Cancel' }))).click();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
    http.expectNone('/api/brews');
  });

  it('after a 500 keeps every value, re-enables the form and emits nothing', async () => {
    await fillValid();
    await addToJournal();
    http.expectOne('/api/brews').flush({}, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    await expectKeptAfterFailure();
  });

  it('after a status 0 failure or a 400 with a field error keeps every value and emits nothing', async () => {
    await fillValid();
    await addToJournal();
    http.expectOne('/api/brews').error(new ProgressEvent('error'));
    fixture.detectChanges();
    await expectKeptAfterFailure();

    await addToJournal();
    http
      .expectOne('/api/brews')
      .flush(
        { errors: [{ field: 'name', code: 'REQUIRED' }] },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();
    await expectKeptAfterFailure();
  });

  it('with only the default date sends no POST and stays open', async () => {
    await addToJournal();

    http.expectNone('/api/brews');
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }));
    expect(await button.getText()).toBe('Add to journal');
    expect(await button.isDisabled()).toBe(false);
    expect(saved).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Log a brew');
  });

  it('with the bean name of only spaces sends no POST', async () => {
    await fillValid();
    await (await field('#bean')).setValue('   ');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(saved).not.toHaveBeenCalled();
  });

  it('sends no POST when the method, roast, rating or date is missing', async () => {
    // method unset
    await fillValidExcept('method');
    await addToJournal();
    http.expectNone('/api/brews');

    // roast unset
    fixture.destroy();
    mount();
    await fillValidExcept('roast');
    await addToJournal();
    http.expectNone('/api/brews');

    // rating unset
    fixture.destroy();
    mount();
    await fillValidExcept('rating');
    await addToJournal();
    http.expectNone('/api/brews');

    // date cleared
    fixture.destroy();
    mount();
    await fillValidExcept('date');
    await (
      await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
    ).setValue('');
    await addToJournal();
    http.expectNone('/api/brews');
    expect(saved).not.toHaveBeenCalled();
  });

  it('with a date typed as 2 Nov 2026 sends no POST', async () => {
    await fillValid();
    await (
      await loader.getHarness(MatDatepickerInputHarness.with({ selector: '#date' }))
    ).setValue('2 Nov 2026');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(saved).not.toHaveBeenCalled();
  });

  it('with an empty create form sends no POST, lists the six invalid fields in the banner in order and moves focus to the banner', async () => {
    await addToJournal();

    http.expectNone('/api/brews');
    expect(bannerTitle()).toBe('6 fields need your attention');
    expect(bannerLinkTexts()).toEqual([
      'Enter a brew name',
      'Enter a bean name',
      'Enter where the beans are from',
      'Choose a brew method',
      'Choose a roast level',
      'Choose a rating from 1 to 5 beans',
    ]);
    expect(document.activeElement).toBe(bannerEl());
    expect(await (await fieldOf('name')).getTextErrors()).toEqual(['Enter a brew name']);
    expect(await (await fieldOf('bean')).getTextErrors()).toEqual(['Enter a bean name']);
    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([
      'Enter where the beans are from',
    ]);
    expect(await (await fieldOf('method')).getTextErrors()).toEqual(['Choose a brew method']);
    expect(
      fixture.nativeElement.querySelector('[data-field="roast"]').classList.contains('has-error'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-field="roast"] p.field-error').textContent,
    ).toContain('Choose a roast level');
    expect(
      fixture.nativeElement.querySelector('[data-field="rating"]').classList.contains('has-error'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-field="rating"] p.field-error').textContent,
    ).toContain('Choose a rating from 1 to 5 beans');
  });

  it('after the banner, a Brew name typed and blurred clears its error and the banner still counts six', async () => {
    await addToJournal();
    await (await field('#name')).setValue('Kenyan Morning');
    await (await field('#name')).blur();
    fixture.detectChanges();

    expect(await (await fieldOf('name')).getTextErrors()).toEqual([]);
    expect(bannerTitle()).toBe('6 fields need your attention');
  });

  it('shows the notes counter from 1801 characters, not at 1800, and turns error-coloured above 2000', async () => {
    const notes = await field('#notes');

    await notes.setValue('a'.repeat(1801));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.counter').textContent.trim()).toBe(
      '1,801 / 2,000',
    );

    await notes.setValue('a'.repeat(1800));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.counter')).toBeNull();

    await notes.setValue('a'.repeat(2001));
    fixture.detectChanges();
    const counter: HTMLElement = fixture.nativeElement.querySelector('.counter');
    expect(counter.textContent.trim()).toBe('2,001 / 2,000');
    expect(counter.classList.contains('counter-error')).toBe(true);
    expect(await notes.getValue()).toHaveLength(2001);
  });

  it('with the date input cleared, submitting shows Choose a date', async () => {
    await fillValid();
    await (await dateInput()).setValue('');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(await (await fieldOf('date')).getTextErrors()).toEqual(['Choose a date']);
  });

  it('with the date typed as 2 Nov 2026, shows only the future date error and sends nothing', async () => {
    await fillValid();
    await (await dateInput()).setValue('2 Nov 2026');
    await addToJournal();

    http.expectNone('/api/brews');
    const errors = form.form.controls.brewDate.errors ?? {};
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['FUTURE_DATE', 'matDatepickerMax']),
    );
    expect(await (await fieldOf('date')).getTextErrors()).toEqual([
      'The date can’t be in the future',
    ]);
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual(['The date can’t be in the future']);
  });

  it('keeps pasted names of 101 characters in full and shows the length error for Brew name, Bean name and Origin', async () => {
    await fillValid();
    await (await field('#name')).setValue('a'.repeat(101));
    await (await field('#bean')).setValue('b'.repeat(101));
    await (await field('#origin')).setValue('c'.repeat(101));
    await addToJournal();

    http.expectNone('/api/brews');
    expect(await (await field('#name')).getValue()).toHaveLength(101);
    expect(await (await fieldOf('name')).getTextErrors()).toEqual([
      'Brew name can be at most 100 characters',
    ]);
    expect(await (await fieldOf('bean')).getTextErrors()).toEqual([
      'Bean name can be at most 100 characters',
    ]);
    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([
      'Origin can be at most 100 characters',
    ]);
  });

  it('with a bean name of only spaces shows Enter a bean name and a banner of exactly one field', async () => {
    await fillValid();
    await (await field('#bean')).setValue('   ');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(await (await fieldOf('bean')).getTextErrors()).toEqual(['Enter a bean name']);
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual(['Enter a bean name']);
  });

  it('with Brew name, Bean name and Origin empty, the banner reads 3 fields need your attention with three links', async () => {
    await fillValid();
    await (await field('#name')).setValue('');
    await (await field('#bean')).setValue('');
    await (await field('#origin')).setValue('');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(bannerTitle()).toBe('3 fields need your attention');
    expect(bannerLinkTexts()).toEqual([
      'Enter a brew name',
      'Enter a bean name',
      'Enter where the beans are from',
    ]);
  });

  it('with no rating, shows Choose a rating from 1 to 5 beans and the rating group reads Not rated', async () => {
    await fillValidExcept('rating');
    await addToJournal();

    http.expectNone('/api/brews');
    const rating: HTMLElement = fixture.nativeElement.querySelector('[data-field="rating"]');
    expect(rating.querySelector('p.field-error')?.textContent).toContain(
      'Choose a rating from 1 to 5 beans',
    );
    expect(rating.textContent).toContain('Not rated');
  });

  it('with an empty create form, Brew name, Bean name, Origin and method have the error state, icon and no hint', async () => {
    await addToJournal();

    for (const name of ['name', 'bean', 'origin', 'method']) {
      const formField = await fieldOf(name);
      expect(await (await formField.host()).hasClass('mat-form-field-invalid')).toBe(true);
      expect(await formField.getTextHints()).toEqual([]);
      const errorEl: HTMLElement = fixture.nativeElement.querySelector(
        `[data-field="${name}"] mat-error`,
      );
      expect(errorEl.classList.contains('field-error')).toBe(true);
      const icon = await loader.getHarness(
        MatIconHarness.with({ ancestor: `[data-field="${name}"] mat-error` }),
      );
      expect(await icon.getName()).toBe('alert');
    }
  });

  it('after Brew name shows its error, typing a valid name removes the error and shows the hint again', async () => {
    await addToJournal();
    const name = await fieldOf('name');
    expect(await (await name.host()).hasClass('mat-form-field-invalid')).toBe(true);
    expect(await name.getTextHints()).toEqual([]);

    await (await field('#name')).setValue('Kenyan Morning');
    fixture.detectChanges();

    expect(await (await name.host()).hasClass('mat-form-field-invalid')).toBe(false);
    expect(await name.getTextHints()).toEqual([
      'A name only you would recognise, like “Sunday Moka”. Must be unique.',
    ]);
  });

  it('clicking the banner links moves focus to Origin, to the roast group and to the rating group', async () => {
    await addToJournal();

    const link = (href: string): HTMLAnchorElement =>
      bannerEl()?.querySelector(`a[href="${href}"]`) as HTMLAnchorElement;

    link('#origin').click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#origin'));

    link('#roast').click();
    fixture.detectChanges();
    const roast: HTMLElement = fixture.nativeElement.querySelector('#roast');
    expect(roast.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.tagName).toBe('BUTTON');

    link('#rating').click();
    fixture.detectChanges();
    const rating: HTMLElement = fixture.nativeElement.querySelector('#rating');
    expect(rating.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.getAttribute('tabindex')).toBe('0');
  });

  it('with the typed date "not a date" and everything else valid, shows Choose a date and sends nothing', async () => {
    await fillValid();
    await (await dateInput()).setValue('not a date');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(await (await fieldOf('date')).getTextErrors()).toEqual(['Choose a date']);
  });

  it('before any submit no roast or rating message and no method error shows, and after submit all three do', async () => {
    await (await field('#bean')).setValue('AA');
    await (await field('#bean')).setValue('');
    await (await field('#origin')).focus();
    await (await field('#origin')).blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-field="roast"] p.field-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-field="rating"] p.field-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-field="roast"]').classList).not.toContain(
      'has-error',
    );
    expect(fixture.nativeElement.querySelector('[data-field="rating"]').classList).not.toContain(
      'has-error',
    );
    expect(await (await (await fieldOf('method')).host()).hasClass('mat-form-field-invalid')).toBe(
      false,
    );
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();

    await addToJournal();

    expect(
      fixture.nativeElement.querySelector('[data-field="roast"]').classList.contains('has-error'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-field="roast"] p.field-error').textContent,
    ).toContain('Choose a roast level');
    expect(
      fixture.nativeElement.querySelector('[data-field="rating"]').classList.contains('has-error'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-field="rating"] p.field-error').textContent,
    ).toContain('Choose a rating from 1 to 5 beans');
    expect(await (await (await fieldOf('method')).host()).hasClass('mat-form-field-invalid')).toBe(
      true,
    );
  });

  it('the notes live region reads the counter only when it appears, changes or crosses 2000', async () => {
    const notes = await field('#notes');
    const live = (): string =>
      fixture.nativeElement
        .querySelector('[data-field="notes"] span.sr-only[aria-live="polite"]')
        .textContent.trim();

    await notes.setValue('a'.repeat(1801));
    fixture.detectChanges();
    expect(live()).toBe('1,801 / 2,000');

    await (await notes.host()).sendKeys('a');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.counter').textContent.trim()).toBe(
      '1,802 / 2,000',
    );
    expect(live()).toBe('1,801 / 2,000');

    await notes.setValue('a'.repeat(2001));
    fixture.detectChanges();
    expect(live()).toBe('2,001 / 2,000');

    await notes.setValue('a'.repeat(1800));
    fixture.detectChanges();
    expect(live()).toBe('');
  });

  it('a Brew name cleared after typing and blurred shows no error state and no mat-error', async () => {
    await (await field('#name')).setValue('Kenyan Morning');
    await (await field('#name')).setValue('');
    await (await field('#name')).blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.mat-form-field-invalid').length).toBe(0);
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
  });

  async function answerSaveWithFieldErrors(
    errors: { field: string; code: string }[],
  ): Promise<void> {
    http.expectOne('/api/brews').flush({ errors }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function originTooLong(): Promise<void> {
    await fillValid();
    await addToJournal();
    await answerSaveWithFieldErrors([{ field: 'origin', code: 'TOO_LONG' }]);
  }

  const DUPLICATE_MESSAGE =
    'You already have a brew called “kenyan morning”. Brew names must be unique, ignoring capitals.';

  async function duplicateName(): Promise<void> {
    await fillValid();
    await (await field('#name')).setValue('  kenyan morning ');
    await addToJournal();
    await answerSaveWithFieldErrors([{ field: 'name', code: 'DUPLICATE' }]);
  }

  it('after a 400 with an origin TOO_LONG error, Origin shows its message in error state, the banner lists it and every value is kept', async () => {
    await originTooLong();

    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([
      'Origin can be at most 100 characters',
    ]);
    expect(await (await (await fieldOf('origin')).host()).hasClass('mat-form-field-invalid')).toBe(
      true,
    );
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual(['Origin can be at most 100 characters']);
    expect(await (await field('#name')).getValue()).toBe('Kenyan Morning');
    expect(await (await field('#origin')).getValue()).toBe('Kenya');
  });

  it('after a 400 with a DUPLICATE name error, Brew name shows the message with the trimmed name and keeps every value', async () => {
    await duplicateName();

    expect(await (await fieldOf('name')).getTextErrors()).toEqual([DUPLICATE_MESSAGE]);
    expect(await (await (await fieldOf('name')).host()).hasClass('mat-form-field-invalid')).toBe(
      true,
    );
    expect(await (await field('#name')).getValue()).toBe('  kenyan morning ');
    expect(await (await field('#bean')).getValue()).toBe('AA Kiambu');
  });

  it('a changed Brew name clears its server error, and the banner keeps it until the next submit, which sends the new name', async () => {
    await duplicateName();
    expect(await (await fieldOf('name')).getTextErrors()).toEqual([DUPLICATE_MESSAGE]);
    expect(bannerTitle()).toBe('1 field needs your attention');

    await (await field('#name')).setValue('Kenyan Evening');
    await (await field('#name')).blur();
    fixture.detectChanges();
    expect(await (await fieldOf('name')).getTextErrors()).toEqual([]);
    expect(await (await (await fieldOf('name')).host()).hasClass('mat-form-field-invalid')).toBe(
      false,
    );
    expect(bannerTitle()).toBe('1 field needs your attention');

    await addToJournal();
    expect(bannerEl()).toBeNull();
    const request = http.expectOne('/api/brews');
    expect(request.request.body.name).toBe('Kenyan Evening');
    request.flush(SAVED, { status: 201, statusText: 'Created' });
    expect(saved).toHaveBeenCalledWith(SAVED);
  });

  it('a changed Origin keeps its server error only until its own change, and the next submit sends once the origin is changed', async () => {
    await originTooLong();

    await (await field('#origin')).setValue('Nyeri');
    await (await field('#origin')).blur();
    fixture.detectChanges();
    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([]);
    expect(await (await (await fieldOf('origin')).host()).hasClass('mat-form-field-invalid')).toBe(
      false,
    );
    expect(bannerTitle()).toBe('1 field needs your attention');

    await addToJournal();
    const request = http.expectOne('/api/brews');
    expect(request.request.body.origin).toBe('Nyeri');
    request.flush(SAVED, { status: 201, statusText: 'Created' });
  });

  it('with an origin TOO_LONG error, changing only Bean name keeps the Origin error, and the next submit sends nothing and lists it again', async () => {
    await originTooLong();

    await (await field('#bean')).setValue('AA Batch');
    fixture.detectChanges();
    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([
      'Origin can be at most 100 characters',
    ]);
    expect(await (await (await fieldOf('origin')).host()).hasClass('mat-form-field-invalid')).toBe(
      true,
    );

    await addToJournal();
    http.expectNone('/api/brews');
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual(['Origin can be at most 100 characters']);
    expect(document.activeElement).toBe(bannerEl());
  });

  it('with a DUPLICATE name error, submitting again without a change sends nothing and lists the name error in the banner with focus on it', async () => {
    await duplicateName();

    await addToJournal();
    http.expectNone('/api/brews');
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual([DUPLICATE_MESSAGE]);
    expect(document.activeElement).toBe(bannerEl());
  });

  it('with an origin TOO_LONG error, clearing Brew name and submitting lists the empty name and the origin error in order', async () => {
    await originTooLong();

    await (await field('#name')).setValue('');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(bannerTitle()).toBe('2 fields need your attention');
    expect(bannerLinkTexts()).toEqual([
      'Enter a brew name',
      'Origin can be at most 100 characters',
    ]);
  });

  it('a 400 with an origin error and a methodId TOO_LONG error shows only the origin error, and the method field gets no error', async () => {
    await fillValid();
    await addToJournal();
    await answerSaveWithFieldErrors([
      { field: 'origin', code: 'TOO_LONG' },
      { field: 'methodId', code: 'TOO_LONG' },
    ]);

    expect(await (await fieldOf('origin')).getTextErrors()).toEqual([
      'Origin can be at most 100 characters',
    ]);
    expect(await (await fieldOf('method')).getTextErrors()).toEqual([]);
    expect(await (await (await fieldOf('method')).host()).hasClass('mat-form-field-invalid')).toBe(
      false,
    );
    expect(bannerTitle()).toBe('1 field needs your attention');
    expect(bannerLinkTexts()).toEqual(['Origin can be at most 100 characters']);
  });

  it('after the dropped methodId TOO_LONG pair, changing Origin and submitting sends the POST', async () => {
    await fillValid();
    await addToJournal();
    await answerSaveWithFieldErrors([
      { field: 'origin', code: 'TOO_LONG' },
      { field: 'methodId', code: 'TOO_LONG' },
    ]);
    expect(bannerTitle()).toBe('1 field needs your attention');

    await (await field('#origin')).setValue('Nyeri');
    await addToJournal();

    const request = http.expectOne('/api/brews');
    expect(request.request.body.origin).toBe('Nyeri');
    request.flush(SAVED, { status: 201, statusText: 'Created' });
  });

  it('a POST that fails with status 0 sets no field error and no banner, and keeps the fields enabled with their values', async () => {
    await fillValid();
    await addToJournal();
    http.expectOne('/api/brews').error(new ProgressEvent('error'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.mat-form-field-invalid').length).toBe(0);
    expect(bannerEl()).toBeNull();
    await expectKeptAfterFailure();
  });

  it('a second click on the busy Saving button sends no second POST and emits saved once', async () => {
    await fillValid();
    await addToJournal();
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Saving…' }))).click();
    fixture.detectChanges();

    const request = http.expectOne('/api/brews');
    request.flush(SAVED, { status: 201, statusText: 'Created' });
    fixture.detectChanges();

    expect(saved).toHaveBeenCalledTimes(1);
    expect(saved).toHaveBeenCalledWith(SAVED);
  });
});
