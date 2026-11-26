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
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { enGB } from 'date-fns/locale';
import { type Mock, vi } from 'vitest';
import { BREWLOG_DATE_FORMATS } from '../core/date-formats';
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
  let snackBar: { open: Mock };
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

  async function field(label: string): Promise<MatInputHarness> {
    const formField = await loader.getHarness(
      MatFormFieldHarness.with({ floatingLabelText: label }),
    );
    return (await formField.getControl(MatInputHarness))!;
  }

  function radios(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.rating-input input[type="radio"]'));
  }

  async function addToJournal(): Promise<void> {
    await (await loader.getHarness(MatButtonHarness.with({ text: 'Add to journal' }))).click();
  }

  async function fillValid(): Promise<void> {
    await (await field('Brew name')).setValue('Kenyan Morning');
    await (await field('Bean name')).setValue('AA Kiambu');
    await (await field('Origin')).setValue('Kenya');
    await (await loader.getHarness(MatSelectHarness)).clickOptions({ text: 'Pour Over' });
    await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).check();
    radios()[4].click();
    fixture.detectChanges();
  }

  async function fillValidExcept(skipped: 'method' | 'roast' | 'rating' | 'date'): Promise<void> {
    await (await field('Brew name')).setValue('Kenyan Morning');
    await (await field('Bean name')).setValue('AA Kiambu');
    await (await field('Origin')).setValue('Kenya');
    if (skipped !== 'method') {
      await (await loader.getHarness(MatSelectHarness)).clickOptions({ text: 'Pour Over' });
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

    expect(await (await field('Brew name')).isDisabled()).toBe(false);
    expect(await (await field('Brew name')).getValue()).toBe('Kenyan Morning');
    expect(await (await field('Bean name')).getValue()).toBe('AA Kiambu');
    expect(await (await field('Origin')).getValue()).toBe('Kenya');
    expect(await (await loader.getHarness(MatSelectHarness)).getValueText()).toBe('Pour Over');
    expect(
      await (await loader.getHarness(MatButtonToggleHarness.with({ text: 'Light' }))).isChecked(),
    ).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('5 of 5');
    expect(await (await loader.getHarness(MatDatepickerInputHarness)).getValue()).toBe(
      '1 Nov 2026',
    );
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Log a brew');
    expect(saved).not.toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
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
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar) as unknown as { open: Mock };
    mount();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  // Happy path

  it('in create mode shows an empty form with the date defaulting to today', async () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Log a brew');
    expect(await (await field('Brew name')).getValue()).toBe('');
    expect(await (await field('Bean name')).getValue()).toBe('');
    expect(await (await field('Origin')).getValue()).toBe('');
    expect(form.form.controls.notes.value).toBe('');
    expect(fixture.nativeElement.querySelector('textarea').value).toBe('');

    expect(form.form.controls.methodId.value).toBeNull();
    const method = await loader.getHarness(MatSelectHarness);
    expect(await method.isEmpty()).toBe(true);
    expect(await method.getValueText()).toBe('Choose a method');

    expect(form.form.controls.roast.value).toBeNull();
    for (const toggle of await loader.getAllHarnesses(MatButtonToggleHarness)) {
      expect(await toggle.isChecked()).toBe(false);
    }

    expect(form.form.controls.rating.value).toBeNull();
    expect(radios().some((radio) => radio.checked)).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Not rated');

    expect(await (await loader.getHarness(MatDatepickerInputHarness)).getValue()).toBe(
      '1 Nov 2026',
    );
  });

  it('with the valid form, sends one POST and emits the saved brew once the server answers 201', async () => {
    await fillValid();
    await addToJournal();

    const request = http.expectOne('/api/brews');
    expect(request.request.body).toEqual(VALID_BODY);

    const busy = fixture.nativeElement.querySelector('button[aria-busy="true"]');
    expect(busy.textContent).toContain('Saving…');
    expect(await (await field('Brew name')).isDisabled()).toBe(true);
    expect(await (await loader.getHarness(MatSelectHarness)).isDisabled()).toBe(true);

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
    await (await loader.getHarness(MatDatepickerInputHarness)).openCalendar();
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
    await (await field('Bean name')).setValue('   ');
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
    await (await loader.getHarness(MatDatepickerInputHarness)).setValue('');
    await addToJournal();
    http.expectNone('/api/brews');
    expect(saved).not.toHaveBeenCalled();
  });

  it('with a date typed as 2 Nov 2026 sends no POST', async () => {
    await fillValid();
    await (await loader.getHarness(MatDatepickerInputHarness)).setValue('2 Nov 2026');
    await addToJournal();

    http.expectNone('/api/brews');
    expect(saved).not.toHaveBeenCalled();
  });
});
