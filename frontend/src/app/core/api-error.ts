import { HttpErrorResponse } from '@angular/common/http';
import { ApiFieldError } from './models';

export interface ApiError {
  kind: 'fields' | 'notFound' | 'protected' | 'network';
  fields: ApiFieldError[];
  code: string | null;
}

const NETWORK: ApiError = { kind: 'network', fields: [], code: null };

function isApiFieldError(item: unknown): item is ApiFieldError {
  return (
    typeof item === 'object' &&
    item !== null &&
    'field' in item &&
    typeof item.field === 'string' &&
    'code' in item &&
    typeof item.code === 'string'
  );
}

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
    if (!Array.isArray(errors) || errors.length === 0 || !errors.every(isApiFieldError)) {
      return NETWORK;
    }
    const fields = errors.map(({ field, code }) => ({ field, code }));
    return { kind: 'fields', fields, code: null };
  }
  if (err.status === 404) return { kind: 'notFound', fields: [], code };
  if (err.status === 409) return { kind: 'protected', fields: [], code };
  return NETWORK;
}
