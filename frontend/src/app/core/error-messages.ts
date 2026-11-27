import { ValidationErrors } from '@angular/forms';

export function brewFieldMessage(field: string, code: string, value?: string): string | null {
  throw new Error(`BREW-26: not implemented: brewFieldMessage(${field}, ${code}, ${value})`);
}

export const BREW_ERROR_ORDER: readonly string[] = [];

export function firstErrorCode(errors: ValidationErrors | null): string | null {
  throw new Error(`BREW-26: not implemented: firstErrorCode(${Object.keys(errors ?? {})})`);
}

export function fieldErrorMessage(
  field: string,
  errors: ValidationErrors | null,
  value?: string,
): string | null {
  throw new Error(`BREW-26: not implemented: fieldErrorMessage(${field}, ${value})`);
}
