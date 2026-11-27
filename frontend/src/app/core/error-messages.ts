import { ValidationErrors } from '@angular/forms';
import { BREW_TEXT_LIMITS } from './brew-limits';

const FIELD_MESSAGES: Record<string, Record<string, string>> = {
  name: {
    REQUIRED: 'Enter a brew name',
    TOO_LONG: `Brew name can be at most ${BREW_TEXT_LIMITS.name} characters`,
  },
  beanName: {
    REQUIRED: 'Enter a bean name',
    TOO_LONG: `Bean name can be at most ${BREW_TEXT_LIMITS.beanName} characters`,
  },
  origin: {
    REQUIRED: 'Enter where the beans are from',
    TOO_LONG: `Origin can be at most ${BREW_TEXT_LIMITS.origin} characters`,
  },
  methodId: {
    REQUIRED: 'Choose a brew method',
    METHOD_NOT_FOUND: 'This method no longer exists. Choose another one.',
  },
  roast: {
    REQUIRED: 'Choose a roast level',
    INVALID: 'Choose a roast level',
  },
  rating: {
    REQUIRED: 'Choose a rating from 1 to 5 beans',
    OUT_OF_RANGE: 'Choose a rating from 1 to 5 beans',
  },
  brewDate: {
    REQUIRED: 'Choose a date',
    FUTURE_DATE: 'The date can’t be in the future',
  },
  notes: {
    TOO_LONG: `Tasting notes can be at most ${BREW_TEXT_LIMITS.notes} characters`,
  },
};

export function brewFieldMessage(field: string, code: string, value?: string): string | null {
  if (field === 'name' && code === 'DUPLICATE') {
    return value === undefined
      ? null
      : `You already have a brew called “${value}”. Brew names must be unique, ignoring capitals.`;
  }
  if (!Object.hasOwn(FIELD_MESSAGES, field)) return null;
  const messages = FIELD_MESSAGES[field];
  return Object.hasOwn(messages, code) ? messages[code] : null;
}

export const BREW_ERROR_ORDER: readonly string[] = [
  'REQUIRED',
  'TOO_LONG',
  'OUT_OF_RANGE',
  'INVALID',
  'FUTURE_DATE',
  'DUPLICATE',
  'METHOD_NOT_FOUND',
];

export function firstErrorCode(errors: ValidationErrors | null): string | null {
  if (errors === null) return null;
  return BREW_ERROR_ORDER.find((code) => Object.hasOwn(errors, code)) ?? null;
}

export function fieldErrorMessage(
  field: string,
  errors: ValidationErrors | null,
  value?: string,
): string | null {
  const code = firstErrorCode(errors);
  return code === null ? null : brewFieldMessage(field, code, value);
}
