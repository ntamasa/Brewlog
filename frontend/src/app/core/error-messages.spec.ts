import { describe, expect, it } from 'vitest';
import { brewFieldMessage, fieldErrorMessage, firstErrorCode } from './error-messages';

const FUTURE = { matDatepickerMax: { max: new Date(2026, 10, 1), actual: new Date(2026, 10, 2) } };

describe('error messages', () => {
  it('brewFieldMessage returns the exact text for each field and code, and fieldErrorMessage shows the duplicate name with its trimmed value', () => {
    expect(brewFieldMessage('name', 'REQUIRED')).toBe('Enter a brew name');
    expect(brewFieldMessage('name', 'TOO_LONG')).toBe('Brew name can be at most 100 characters');
    expect(brewFieldMessage('name', 'DUPLICATE', 'kenyan morning')).toBe(
      'You already have a brew called “kenyan morning”. Brew names must be unique, ignoring capitals.',
    );
    expect(brewFieldMessage('beanName', 'REQUIRED')).toBe('Enter a bean name');
    expect(brewFieldMessage('beanName', 'TOO_LONG')).toBe(
      'Bean name can be at most 100 characters',
    );
    expect(brewFieldMessage('origin', 'REQUIRED')).toBe('Enter where the beans are from');
    expect(brewFieldMessage('origin', 'TOO_LONG')).toBe('Origin can be at most 100 characters');
    expect(brewFieldMessage('methodId', 'REQUIRED')).toBe('Choose a brew method');
    expect(brewFieldMessage('methodId', 'METHOD_NOT_FOUND')).toBe(
      'This method no longer exists. Choose another one.',
    );
    expect(brewFieldMessage('roast', 'REQUIRED')).toBe('Choose a roast level');
    expect(brewFieldMessage('roast', 'INVALID')).toBe('Choose a roast level');
    expect(brewFieldMessage('rating', 'REQUIRED')).toBe('Choose a rating from 1 to 5 beans');
    expect(brewFieldMessage('rating', 'OUT_OF_RANGE')).toBe('Choose a rating from 1 to 5 beans');
    expect(brewFieldMessage('brewDate', 'REQUIRED')).toBe('Choose a date');
    expect(brewFieldMessage('brewDate', 'FUTURE_DATE')).toBe('The date can’t be in the future');
    expect(brewFieldMessage('notes', 'TOO_LONG')).toBe(
      'Tasting notes can be at most 2000 characters',
    );
    expect(fieldErrorMessage('name', { DUPLICATE: true }, 'kenyan morning')).toBe(
      'You already have a brew called “kenyan morning”. Brew names must be unique, ignoring capitals.',
    );
  });

  it('firstErrorCode skips Material datepicker keys whatever their order, so a future date reads FUTURE_DATE', () => {
    expect(firstErrorCode({ ...FUTURE, FUTURE_DATE: true })).toBe('FUTURE_DATE');
    expect(firstErrorCode({ FUTURE_DATE: true, ...FUTURE })).toBe('FUTURE_DATE');
    expect(fieldErrorMessage('brewDate', { ...FUTURE, FUTURE_DATE: true })).toBe(
      'The date can’t be in the future',
    );
  });

  it('firstErrorCode gives REQUIRED before TOO_LONG, and a parse error reads as an empty date', () => {
    const parse = { matDatepickerParse: { text: 'not a date' } };

    expect(firstErrorCode({ ...parse, REQUIRED: true })).toBe('REQUIRED');
    expect(fieldErrorMessage('brewDate', { ...parse, REQUIRED: true })).toBe('Choose a date');
    expect(firstErrorCode({ TOO_LONG: true, REQUIRED: true })).toBe('REQUIRED');
  });

  it('brewFieldMessage returns null for field and code pairs with no text, and never throws', () => {
    expect(brewFieldMessage('origin', 'DUPLICATE')).toBeNull();
    expect(brewFieldMessage('methodId', 'TOO_LONG')).toBeNull();
    expect(brewFieldMessage('brewDate', 'matDatepickerMax')).toBeNull();
    expect(brewFieldMessage('unknown', 'REQUIRED')).toBeNull();
  });

  it('firstErrorCode and fieldErrorMessage give nothing when only the datepicker max or no error is set', () => {
    expect(firstErrorCode(FUTURE)).toBeNull();
    expect(firstErrorCode({})).toBeNull();
    expect(firstErrorCode(null)).toBeNull();
    expect(fieldErrorMessage('brewDate', FUTURE)).toBeNull();
  });
});
