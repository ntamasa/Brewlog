import { Component, input, output } from '@angular/core';
import { BrewQuery } from '../../core/models';

@Component({
  selector: 'app-journal-toolbar',
  templateUrl: './journal-toolbar.html',
  styleUrl: './journal-toolbar.scss',
})
export class JournalToolbar {
  query = input.required<BrewQuery>();
  searchChange = output<string>();
}
