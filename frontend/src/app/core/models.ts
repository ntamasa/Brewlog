export type Roast = 'LIGHT' | 'MEDIUM' | 'DARK';

export type SortKey = 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST';

export interface MethodRef {
  id: number;
  name: string;
  iconKey: string;
}

export interface Brew {
  id: number;
  name: string;
  beanName: string;
  origin: string;
  method: MethodRef;
  roast: Roast;
  rating: number;
  brewDate: string;
  notes: string | null;
}

export interface BrewMethod {
  id: number;
  name: string;
  iconKey: string;
  predefined: boolean;
  protected: boolean;
  position: number | null;
  brewCount: number;
}

export interface BrewPage {
  items: Brew[];
  page: number;
  totalPages: number;
  matchingCount: number;
  totalCount: number;
}

export interface BrewQuery {
  q: string;
  methodId: number | null;
  roast: Roast | null;
  minRating: number | null;
  sort: SortKey;
  page: number;
}

export const DEFAULT_QUERY: BrewQuery = {
  q: '',
  methodId: null,
  roast: null,
  minRating: null,
  sort: 'NEWEST',
  page: 1,
};

export interface ApiFieldError {
  field: string;
  code: string;
}
