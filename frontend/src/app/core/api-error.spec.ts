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

  const NETWORK = { kind: 'network', fields: [], code: null };

  function badRequest(errors: unknown): HttpErrorResponse {
    return new HttpErrorResponse({ status: 400, error: { errors } });
  }

  it('keeps only field and code of valid field errors, in order', () => {
    expect(
      parseApiError(
        badRequest([
          { field: 'origin', code: 'TOO_LONG', extra: 1 },
          { field: 'name', code: 'REQUIRED' },
        ]),
      ),
    ).toEqual({
      kind: 'fields',
      fields: [
        { field: 'origin', code: 'TOO_LONG' },
        { field: 'name', code: 'REQUIRED' },
      ],
      code: null,
    });
  });

  it('reads a 400 whose errors contain null as network without throwing', () => {
    expect(() => parseApiError(badRequest([null]))).not.toThrow();
    expect(parseApiError(badRequest([null]))).toEqual(NETWORK);
  });

  it('reads a 400 whose error item has a non-string field as network', () => {
    expect(parseApiError(badRequest([{ field: 1 }]))).toEqual(NETWORK);
  });

  it('reads a 400 whose error item is a string as network', () => {
    expect(parseApiError(badRequest(['x']))).toEqual(NETWORK);
  });

  it('reads a 400 with one malformed item among valid ones as network', () => {
    expect(parseApiError(badRequest([{ field: 'name', code: 'REQUIRED' }, null]))).toEqual(NETWORK);
  });

  it('reads a 400 whose error item has no code as network', () => {
    expect(parseApiError(badRequest([{ field: 'name' }]))).toEqual(NETWORK);
  });

  it('reads a 400 whose error item has a non-string code as network', () => {
    expect(parseApiError(badRequest([{ field: 'name', code: 5 }]))).toEqual(NETWORK);
  });
});
