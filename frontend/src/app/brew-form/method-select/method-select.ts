import { Component, computed, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { methodsAz } from '../../core/format';
import { BrewMethod } from '../../core/models';
@Component({
  selector: 'app-method-select',
  imports: [MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './method-select.html',
  styleUrl: './method-select.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MethodSelect), multi: true },
  ],
})
export class MethodSelect implements ControlValueAccessor {
  methods = input.required<BrewMethod[]>();

  private readonly matSelect = viewChild.required(MatSelect);

  protected readonly sorted = computed(() => methodsAz(this.methods()));
  protected readonly selected = computed(
    () => this.methods().find((method) => method.id === this.value()) ?? null,
  );
  protected readonly value = signal<number | null>(null);
  protected readonly isDisabled = signal(false);

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected select(id: number): void {
    this.value.set(id);
    this.onChange(id);
  }

  protected touch(): void {
    this.onTouched();
  }

  protected closeOnEscape(event: Event): void {
    const matSelect = this.matSelect();
    if (!matSelect.panelOpen) return; // listbox closed: the drawer handles Esc as before
    event.stopPropagation(); // never reaches mat-sidenav
    event.preventDefault();
    matSelect.close(); // the overlay never sees this Esc, so close it here
  }
}
