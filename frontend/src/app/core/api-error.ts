import { ApiFieldError } from './models';

export interface ApiError {
  kind: 'fields' | 'notFound' | 'protected' | 'network';
  fields: ApiFieldError[];
  code: string | null;
}

export function parseApiError(err: unknown): ApiError {
  throw new Error(`BREW-26: not implemented: parseApiError(${String(err)})`);
}
