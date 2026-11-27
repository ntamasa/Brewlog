import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('provides outlined, dynamic-sizing form field defaults with no required marker', () => {
    expect(appConfig.providers).toContainEqual({
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic', hideRequiredMarker: true },
    });
  });
});
