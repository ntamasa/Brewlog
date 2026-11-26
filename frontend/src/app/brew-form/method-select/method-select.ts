import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { methodsAz } from '../../core/format';
import { BrewMethod } from '../../core/models';
import { MethodIcon } from '../../shared/method-icon/method-icon';

@Component({
  selector: 'app-method-select',
  imports: [MatFormFieldModule, MatSelectModule, MethodIcon],
  templateUrl: './method-select.html',
  styleUrl: './method-select.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MethodSelect), multi: true },
  ],
})
export class MethodSelect implements ControlValueAccessor {
  methods = input.required<BrewMethod[]>();

  protected readonly sorted = computed(() => methodsAz(this.methods()));
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
}
