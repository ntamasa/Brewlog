import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { parseApiError } from './api-error';

describe('parseApiError', () => {
  it('reads a 400 with field errors, a 404 with its code and a 409 with its code', () => {
    expect(
      parseApiError(
        new HttpErrorResponse({
          status: 400,
          error: { errors: [{ field: 'name', code: 'DUPLICATE' }] },
        }),
      ),
    ).toEqual({ kind: 'fields', fields: [{ field: 'name', code: 'DUPLICATE' }], code: null });

    expect(
      parseApiError(new HttpErrorResponse({ status: 404, error: { code: 'BREW_NOT_FOUND' } })),
    ).toEqual({ kind: 'notFound', code: 'BREW_NOT_FOUND', fields: [] });

    expect(
      parseApiError(new HttpErrorResponse({ status: 409, error: { code: 'PROTECTED' } })).kind,
    ).toBe('protected');
  });

  it('reads status 0, a 503 and a 400 without errors as network', () => {
    expect(parseApiError(new HttpErrorResponse({ status: 0 })).kind).toBe('network');
    expect(parseApiError(new HttpErrorResponse({ status: 503 })).kind).toBe('network');
    expect(parseApiError(new HttpErrorResponse({ status: 400, error: {} })).kind).toBe('network');
  });
});
