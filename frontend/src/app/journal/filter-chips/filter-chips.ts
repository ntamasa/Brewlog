import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrewQuery } from '../../core/models';
import { FilterKey, isFiltered } from '../journal-query';

@Component({
  selector: 'app-filter-chips',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.scss',
})
export class FilterChips {
  query = input.required<BrewQuery>();
  remove = output<FilterKey>();
  clearAll = output<void>();

  protected readonly isFiltered = computed(() => isFiltered(this.query()));
}
