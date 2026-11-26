import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { format, startOfDay } from 'date-fns';
import { BrewApi } from '../core/brew-api';
import { Brew, BrewBody, BrewMethod, Roast } from '../core/models';
import { BeanRating } from '../shared/bean-rating/bean-rating';
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
})
export class BrewForm {
  readonly mode = input<'create' | 'edit'>('create');
  readonly brew = input<Brew | null>(null);
  readonly methods = input.required<BrewMethod[]>();
  readonly saved = output<Brew>();
  readonly closed = output<void>();

  private readonly brewApi = inject(BrewApi);

  protected readonly today = startOfDay(new Date());
  readonly saving = signal(false);

  readonly form = new FormGroup<BrewFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    beanName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    origin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    notes: new FormControl('', { nonNullable: true }),
    methodId: new FormControl<number | null>(null, Validators.required),
    roast: new FormControl<Roast | null>(null, Validators.required),
    rating: new FormControl<number | null>(null, Validators.required),
    brewDate: new FormControl<Date | null>(this.today, Validators.required),
  });

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      // interim: BREW-27 adds the messages and the banner here
      this.form.markAllAsTouched();
      return; // nothing is sent
    }
    // read before disable(): a disabled group's .value is {}
    const body = this.toBody(this.form.getRawValue());
    this.saving.set(true);
    this.form.disable();
    this.brewApi.create(body).subscribe({
      next: (brew) => this.saved.emit(brew),
      error: () => {
        // any status: values kept, form stays open
        this.saving.set(false);
        this.form.enable();
      },
    });
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
