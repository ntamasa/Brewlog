import { HttpErrorResponse } from '@angular/common/http';
import { ApiFieldError } from './models';

export interface ApiError {
  kind: 'fields' | 'notFound' | 'protected' | 'network';
  fields: ApiFieldError[];
  code: string | null;
}

const NETWORK: ApiError = { kind: 'network', fields: [], code: null };

export function parseApiError(err: unknown): ApiError {
  if (!(err instanceof HttpErrorResponse)) return NETWORK;
  const body: unknown = err.error;
  const bodyObject = typeof body === 'object' && body !== null ? body : null;
  const code =
    bodyObject !== null && 'code' in bodyObject && typeof bodyObject.code === 'string'
      ? bodyObject.code
      : null;

  if (err.status === 400) {
    const errors: unknown =
      bodyObject !== null && 'errors' in bodyObject ? bodyObject.errors : null;
    if (!Array.isArray(errors) || errors.length === 0) return NETWORK;
    const fields = (errors as ApiFieldError[]).map((item) => ({
      field: item.field,
      code: item.code,
    }));
    return { kind: 'fields', fields, code: null };
  }
  if (err.status === 404) return { kind: 'notFound', fields: [], code };
  if (err.status === 409) return { kind: 'protected', fields: [], code };
  return NETWORK;
}
