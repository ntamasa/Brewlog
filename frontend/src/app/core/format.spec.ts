import { brewCount, formatDate, methodsAz } from './format';
import { BrewMethod } from './models';

function method(name: string, protectedMethod = false): BrewMethod {
  return {
    id: 1,
    name,
    iconKey: 'cup',
    predefined: false,
    protected: protectedMethod,
    position: null,
    brewCount: 0,
  };
}

describe('methodsAz', () => {
  it('sorts A-Z ignoring case with the protected Other last', () => {
    const sorted = methodsAz([
      method('Pour Over'),
      method('Other', true),
      method('chemex'),
      method('AeroPress'),
    ]).map((m) => m.name);

    expect(sorted).toEqual(['AeroPress', 'chemex', 'Pour Over', 'Other']);
  });
});

describe('formatDate', () => {
  it('formats a brew date as day, short month and year', () => {
    expect(formatDate('2026-10-28')).toBe('28 Oct 2026');
  });

  it('does not pad a single-digit day', () => {
    expect(formatDate('2026-11-01')).toBe('1 Nov 2026');
  });
});

describe('brewCount', () => {
  it('counts many brews with the plural', () => {
    expect(brewCount(41)).toBe('41 brews');
  });

  it('uses the singular for exactly one brew', () => {
    expect(brewCount(1)).toBe('1 brew');
  });

  it('uses the plural for zero brews', () => {
    expect(brewCount(0)).toBe('0 brews');
  });
});
