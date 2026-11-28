import {
  Component,
  ElementRef,
  Injector,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { format, startOfDay } from 'date-fns';
import { map } from 'rxjs';
import { BrewApi } from '../core/brew-api';
import { BREW_TEXT_LIMITS, NOTES_WARN_AT } from '../core/brew-limits';
import { parseApiError } from '../core/api-error';
import { brewFieldMessage, fieldErrorMessage } from '../core/error-messages';
import { ApiFieldError, Brew, BrewBody, BrewMethod, Roast } from '../core/models';
import { BeanRating } from '../shared/bean-rating/bean-rating';
import { BREW_VALIDATORS } from './brew-validators';
import { MethodSelect } from './method-select/method-select';

export interface BrewFormControls {
  name: FormControl<string>;
  beanName: FormControl<string>;
  origin: FormControl<string>;
  notes: FormControl<string>;
  methodId: FormControl<number | null>;
  roast: FormControl<Roast | null>;
  rating: FormControl<number | null>;
  brewDate: FormControl<Date | null>;
}

export interface BannerLink {
  id: string;
  message: string;
}

export interface FormBanner {
  kind: 'fields';
  links: BannerLink[];
}

const BANNER_FIELDS: { field: keyof BrewFormControls; id: string }[] = [
  { field: 'name', id: 'name' },
  { field: 'beanName', id: 'bean' },
  { field: 'origin', id: 'origin' },
  { field: 'methodId', id: 'method-btn' },
  { field: 'roast', id: 'roast' },
  { field: 'rating', id: 'rating' },
  { field: 'brewDate', id: 'date' },
  { field: 'notes', id: 'notes' },
];

@Component({
  selector: 'app-brew-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    BeanRating,
    MethodSelect,
  ],
  templateUrl: './brew-form.html',
  styleUrl: './brew-form.scss',
  providers: [{ provide: ErrorStateMatcher, useExisting: forwardRef(() => BrewForm) }],
})
export class BrewForm implements ErrorStateMatcher {
  readonly mode = input<'create' | 'edit'>('create');
  readonly brew = input<Brew | null>(null);
  readonly methods = input.required<BrewMethod[]>();
  readonly saved = output<Brew>();
  readonly closed = output<void>();

  private readonly brewApi = inject(BrewApi);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly bannerEl = viewChild<ElementRef<HTMLElement>>('banner');

  protected readonly today = startOfDay(new Date());
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly banner = signal<FormBanner | null>(null);

  readonly form = new FormGroup<BrewFormControls>({
    name: new FormControl('', { nonNullable: true, validators: BREW_VALIDATORS.name }),
    beanName: new FormControl('', { nonNullable: true, validators: BREW_VALIDATORS.beanName }),
    origin: new FormControl('', { nonNullable: true, validators: BREW_VALIDATORS.origin }),
    notes: new FormControl('', { nonNullable: true, validators: BREW_VALIDATORS.notes }),
    methodId: new FormControl<number | null>(null, BREW_VALIDATORS.methodId),
    roast: new FormControl<Roast | null>(null, BREW_VALIDATORS.roast),
    rating: new FormControl<number | null>(null, BREW_VALIDATORS.rating),
    brewDate: new FormControl<Date | null>(this.today, BREW_VALIDATORS.brewDate),
  });

  protected readonly notesLength = toSignal(
    this.form.controls.notes.valueChanges.pipe(map((value) => value.trim().length)),
    { initialValue: 0 },
  );
  protected readonly counterText = computed(
    () =>
      `${this.notesLength().toLocaleString('en-US')} / ${BREW_TEXT_LIMITS.notes.toLocaleString('en-US')}`,
  );
  protected readonly notesState = computed(() =>
    this.notesLength() > BREW_TEXT_LIMITS.notes
      ? 'over'
      : this.notesLength() > NOTES_WARN_AT
        ? 'near'
        : 'none',
  );
  // recomputed only when notesState changes; the counter text is read untracked
  protected readonly notesAnnouncement = linkedSignal({
    source: this.notesState,
    computation: (state) => (state === 'none' ? '' : untracked(this.counterText)),
  });

  fieldMessage(field: keyof BrewFormControls): string | null {
    return fieldErrorMessage(field, this.form.controls[field].errors, this.messageValue(field));
  }

  // the value a message quotes: only the brew name's DUPLICATE message does
  private messageValue(field: keyof BrewFormControls): string | undefined {
    return field === 'name' ? this.form.controls.name.value.trim() : undefined;
  }

  shownMessage(field: keyof BrewFormControls): string | null {
    const control = this.form.controls[field];
    if (!this.submitted() || !(control.touched || control.dirty)) return null;
    return this.fieldMessage(field);
  }

  isErrorState(control: AbstractControl | null): boolean {
    const field = (Object.keys(this.form.controls) as (keyof BrewFormControls)[]).find(
      (key) => this.form.controls[key] === control,
    );
    return field !== undefined && this.shownMessage(field) !== null;
  }

  private setFieldsBanner(): void {
    const links: BannerLink[] = [];
    for (const { field, id } of BANNER_FIELDS) {
      const message = this.fieldMessage(field);
      if (message !== null) links.push({ id, message });
    }
    this.banner.set(links.length === 0 ? null : { kind: 'fields', links });
    if (links.length > 0) {
      afterNextRender(() => this.bannerEl()?.nativeElement.focus(), { injector: this.injector });
    }
  }

  protected focusField(event: Event, id: string): void {
    event.preventDefault();
    const target = this.host.nativeElement.querySelector<HTMLElement>('#' + id);
    const focusable =
      target?.tagName === 'FIELDSET'
        ? target.querySelector<HTMLElement>('input[tabindex="0"], button')
        : target;
    focusable?.focus();
  }

  submit(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.setFieldsBanner(); // nothing is sent
      return;
    }
    this.banner.set(null); // the old banner hides while the request is in flight
    // read before disable(): a disabled group's .value is {}
    const body = this.toBody(this.form.getRawValue());
    this.saving.set(true);
    this.form.disable();
    this.brewApi.create(body).subscribe({
      next: (brew) => this.saved.emit(brew),
      error: (err: unknown) => {
        // any status: values kept, form stays open
        this.saving.set(false);
        // enable() re-runs every validator, so it must come before the server errors are set
        this.form.enable();
        const error = parseApiError(err);
        if (error.kind !== 'fields') return;
        this.setServerFieldErrors(error.fields);
        this.setFieldsBanner();
      },
    });
  }

  private setServerFieldErrors(fields: ApiFieldError[]): void {
    const byField = new Map<keyof BrewFormControls, ValidationErrors>();
    for (const { field, code } of fields) {
      // a pair with no text to show is dropped: it must not block sending
      if (!Object.hasOwn(this.form.controls, field)) continue;
      const key = field as keyof BrewFormControls;
      if (brewFieldMessage(key, code, this.messageValue(key)) === null) continue;
      byField.set(key, { ...byField.get(key), [code]: true });
    }
    for (const [key, errors] of byField) {
      this.form.controls[key].setErrors(errors);
    }
  }

  toBody(value: {
    name: string;
    beanName: string;
    origin: string;
    notes: string;
    methodId: number | null;
    roast: Roast | null;
    rating: number | null;
    brewDate: Date | null;
  }): BrewBody {
    return {
      name: value.name,
      beanName: value.beanName,
      origin: value.origin,
      methodId: value.methodId,
      roast: value.roast,
      rating: value.rating,
      brewDate: value.brewDate === null ? null : format(value.brewDate, 'yyyy-MM-dd'),
      notes: value.notes === '' ? null : value.notes,
    };
  }
}
