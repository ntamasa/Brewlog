import { MatDateFormats } from '@angular/material/core';

export const BREWLOG_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'd MMM yyyy' },
  display: {
    dateInput: 'd MMM yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'd MMMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};
