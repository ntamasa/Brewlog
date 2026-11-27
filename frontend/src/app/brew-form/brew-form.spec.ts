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

  async function expectKeptAfterFailure(): Promise<void> {
    fixture.detectChanges();
    const button = await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }));
    expect(await button.isDisabled()).toBe(false);
    expect(fixture.nativeElement.querySelector('button[aria-busy]')).toBeNull();

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

  it('with only the default date shows no field in the error state', async () => {
    await addToJournal();

    http.expectNone('/api/brews');
    expect(fixture.nativeElement.querySelectorAll('.mat-form-field-invalid').length).toBe(0);
  });

  it('a Brew name cleared after typing and blurred shows no error state and no mat-error', async () => {
    await (await field('#name')).setValue('Kenyan Morning');
    await (await field('#name')).setValue('');
    await (await field('#name')).blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.mat-form-field-invalid').length).toBe(0);
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
  });
});
