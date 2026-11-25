import { format, parseISO } from 'date-fns';

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy');
}

export function brewCount(n: number): string {
  return n === 1 ? '1 brew' : `${n} brews`;
}
