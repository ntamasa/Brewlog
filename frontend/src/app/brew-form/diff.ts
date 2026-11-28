import { Brew, BrewBody } from '../core/models';

export function changedFields(original: Brew, value: BrewBody): Partial<BrewBody> {
  throw new Error(
    `BREW-34: not implemented: changedFields(${JSON.stringify(original)}, ${JSON.stringify(value)})`,
  );
}
