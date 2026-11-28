import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrewQuery, SortKey } from '../../core/models';

@Component({
  selector: 'app-journal-toolbar',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './journal-toolbar.html',
  styleUrl: './journal-toolbar.scss',
})
export class JournalToolbar {
  query = input.required<BrewQuery>();
  searchChange = output<string>();
  sort = output<SortKey>();
}
