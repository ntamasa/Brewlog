import { format, parseISO } from 'date-fns';
import { BrewMethod } from './models';

export function methodsAz(methods: BrewMethod[]): BrewMethod[] {
  return [...methods].sort(
    (a, b) =>
      Number(a.protected) - Number(b.protected) ||
      a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy');
}

export function brewCount(n: number): string {
  return n === 1 ? '1 brew' : `${n} brews`;
}
