import { Routes } from '@angular/router';
import { LandingPage } from './landing/landing-page/landing-page';
import { JournalPage } from './journal/journal-page/journal-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'journal', component: JournalPage },
  { path: '**', redirectTo: '' },
];
