import { Brew, BrewBody } from '../core/models';

/** The PATCH body: only the fields of `value` that differ from `original`. */
export function changedFields(original: Brew, value: BrewBody): Partial<BrewBody> {
  const changes: Partial<BrewBody> = {};
  if (value.name !== original.name) changes.name = value.name;
  if (value.beanName !== original.beanName) changes.beanName = value.beanName;
  if (value.origin !== original.origin) changes.origin = value.origin;
  if (value.methodId !== original.method.id) changes.methodId = value.methodId;
  if (value.roast !== original.roast) changes.roast = value.roast;
  if (value.rating !== original.rating) changes.rating = value.rating;
  if (value.brewDate !== original.brewDate) changes.brewDate = value.brewDate;
  const notes = value.notes === null || value.notes.trim() === '' ? null : value.notes;
  if (notes !== original.notes) changes.notes = notes;
  return changes;
}
