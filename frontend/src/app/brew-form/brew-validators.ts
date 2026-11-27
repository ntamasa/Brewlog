import { ValidatorFn } from '@angular/forms';
import type { BrewFormControls } from './brew-form';

export const requiredTrimmed: ValidatorFn = () => {
  throw new Error('BREW-26: not implemented: requiredTrimmed');
};

export function maxTrimmedLength(max: number): ValidatorFn {
  throw new Error(`BREW-26: not implemented: maxTrimmedLength(${max})`);
}

export const notAfterToday: ValidatorFn = () => {
  throw new Error('BREW-26: not implemented: notAfterToday');
};

export const BREW_VALIDATORS: Record<keyof BrewFormControls, ValidatorFn[]> = {
  name: [],
  beanName: [],
  origin: [],
  notes: [],
  methodId: [],
  roast: [],
  rating: [],
  brewDate: [],
};
