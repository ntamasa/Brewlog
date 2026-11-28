import { FormControl } from '@angular/forms';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { maxTrimmedLength, notAfterToday, requiredTrimmed } from './brew-validators';

function control(value: unknown): FormControl {
  return new FormControl<unknown>(value);
}

describe('brew validators', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 1, 9, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requiredTrimmed accepts a name and maxTrimmedLength accepts 100 characters, also after trimming', () => {
    const hundred = 'a'.repeat(100);

    expect(requiredTrimmed(control('Kenyan Morning'))).toBeNull();
    expect(maxTrimmedLength(100)(control(hundred))).toBeNull();
    expect(maxTrimmedLength(100)(control('  ' + hundred + '  '))).toBeNull();
  });

  it('notAfterToday accepts a date later on today and an empty date', () => {
    expect(notAfterToday(control(new Date(2026, 10, 1, 23, 59)))).toBeNull();
    expect(notAfterToday(control(null))).toBeNull();
  });

  it('requiredTrimmed rejects spaces, an empty string and null with REQUIRED', () => {
    expect(requiredTrimmed(control('   '))).toEqual({ REQUIRED: true });
    expect(requiredTrimmed(control(''))).toEqual({ REQUIRED: true });
    expect(requiredTrimmed(control(null))).toEqual({ REQUIRED: true });
  });

  it('maxTrimmedLength rejects 101 name characters and 2001 notes characters with TOO_LONG', () => {
    expect(maxTrimmedLength(100)(control('a'.repeat(101)))).toEqual({ TOO_LONG: true });
    expect(maxTrimmedLength(2000)(control('a'.repeat(2001)))).toEqual({ TOO_LONG: true });
  });

  it('notAfterToday rejects 2 Nov 2026 on 1 Nov 2026 with FUTURE_DATE', () => {
    expect(notAfterToday(control(new Date(2026, 10, 2)))).toEqual({ FUTURE_DATE: true });
  });
});
