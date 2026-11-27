import { Component, input, output } from '@angular/core';
import { BrewQuery } from '../../core/models';

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.html',
  styleUrl: './filter-chips.scss',
})
export class FilterChips {
  query = input.required<BrewQuery>();
  remove = output<'q' | 'methodId' | 'roast' | 'minRating'>();
  clearAll = output<void>();
}
