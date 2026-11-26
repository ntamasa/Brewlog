import {
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

const BEAN_COUNT = 5;

let nextGroupId = 0;

@Component({
  selector: 'app-bean-rating',
  imports: [MatIconModule],
  templateUrl: './bean-rating.html',
  styleUrl: './bean-rating.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BeanRating), multi: true },
  ],
})
export class BeanRating implements ControlValueAccessor {
  value = input<number | null>(null);
  mode = input<'display' | 'input'>('display');

  protected readonly score = computed(() => this.value() ?? 0);
  protected readonly beans = computed(() =>
    Array.from({ length: BEAN_COUNT }, (_, i) => i < this.score()),
  );
  protected readonly label = computed(() => `${this.score()} of ${BEAN_COUNT} beans`);

  protected readonly beanNumbers = Array.from({ length: BEAN_COUNT }, (_, i) => i + 1);
  protected readonly groupName = `bean-rating-${++nextGroupId}`;
  protected readonly current = signal<number | null>(null);
  protected readonly isDisabled = signal(false);
  protected readonly beanInputs = viewChildren<ElementRef<HTMLInputElement>>('beanInput');

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.current.set(value);
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

  protected select(value: number): void {
    if (value === this.current()) {
      return;
    }
    this.current.set(value);
    this.onChange(value);
  }

  protected onFocusOut(event: FocusEvent, group: HTMLElement): void {
    if (!group.contains(event.relatedTarget as Node | null)) {
      this.onTouched();
    }
  }

  protected onKey(event: KeyboardEvent, bean: number): void {
    const value = this.current();
    let next: number | null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(BEAN_COUNT, (value ?? 0) + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = value === null ? null : Math.max(1, value - 1);
        break;
      case ' ':
        next = bean;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next === null) {
      return;
    }
    this.select(next);
    this.beanInputs()[next - 1].nativeElement.focus();
  }
}
