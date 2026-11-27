import { ValidatorFn } from '@angular/forms';
import { isAfter, startOfDay } from 'date-fns';
import type { BrewFormControls } from './brew-form';

export const requiredTrimmed: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (value === null || (typeof value === 'string' && value.trim() === '')) {
    return { REQUIRED: true };
  }
  return null;
};

export function maxTrimmedLength(max: number): ValidatorFn {
  return (control) => {
    const value: unknown = control.value;
    const length = typeof value === 'string' ? value.trim().length : 0;
    return length > max ? { TOO_LONG: true } : null;
  };
}

export const notAfterToday: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (!(value instanceof Date)) return null;
  return isAfter(startOfDay(value), startOfDay(new Date())) ? { FUTURE_DATE: true } : null;
};

export const BREW_VALIDATORS: Record<keyof BrewFormControls, ValidatorFn[]> = {
  name: [requiredTrimmed, maxTrimmedLength(100)],
  beanName: [requiredTrimmed, maxTrimmedLength(100)],
  origin: [requiredTrimmed, maxTrimmedLength(100)],
  notes: [maxTrimmedLength(2000)],
  methodId: [requiredTrimmed],
  roast: [requiredTrimmed],
  rating: [requiredTrimmed],
  brewDate: [requiredTrimmed, notAfterToday],
};
