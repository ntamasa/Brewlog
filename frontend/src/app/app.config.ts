import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { enGB } from 'date-fns/locale';
import { routes } from './app.routes';
import { BREWLOG_DATE_FORMATS } from './core/date-formats';
import { BREWLOG_FORM_FIELD_OPTIONS } from './core/form-field-options';
import { registerIcons } from './core/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(),
    provideAppInitializer(registerIcons),
    provideDateFnsAdapter(BREWLOG_DATE_FORMATS),
    { provide: MAT_DATE_LOCALE, useValue: enGB },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
  ],
};
