import { Brew, BrewBody } from '../core/models';
import { changedFields } from './diff';

const KENYAN_MORNING: Brew = {
  id: 7,
  name: 'Kenyan Morning',
  beanName: 'AA Kiambu',
  origin: 'Kenya',
  method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
  roast: 'LIGHT',
  rating: 5,
  brewDate: '2026-10-28',
  notes: 'Bright',
};

/** The form's value for Kenyan Morning, unchanged. */
function formValue(overrides: Partial<BrewBody> = {}): BrewBody {
  return {
    name: 'Kenyan Morning',
    beanName: 'AA Kiambu',
    origin: 'Kenya',
    methodId: 2,
    roast: 'LIGHT',
    rating: 5,
    brewDate: '2026-10-28',
    notes: 'Bright',
    ...overrides,
  };
}

describe('changedFields', () => {
  it('returns only the rating when only the rating changed', () => {
    expect(changedFields(KENYAN_MORNING, formValue({ rating: 4 }))).toEqual({ rating: 4 });
  });

  it('returns notes null when the notes are emptied', () => {
    expect(changedFields(KENYAN_MORNING, formValue({ notes: '' }))).toEqual({ notes: null });
  });

  it('returns the method id and the roast when both changed', () => {
    expect(changedFields(KENYAN_MORNING, formValue({ methodId: 4, roast: 'DARK' }))).toEqual({
      methodId: 4,
      roast: 'DARK',
    });
  });

  it('returns an empty object when nothing changed', () => {
    expect(changedFields(KENYAN_MORNING, formValue())).toEqual({});
  });

  it('leaves notes out when the original notes are null and the form notes are only spaces', () => {
    const original: Brew = { ...KENYAN_MORNING, notes: null };

    expect(changedFields(original, formValue({ notes: '   ' }))).not.toHaveProperty('notes');
  });
});
