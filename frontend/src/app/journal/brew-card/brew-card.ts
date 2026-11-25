import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { formatDate } from '../../core/format';
import { Brew } from '../../core/models';
import { BeanRating } from '../../shared/bean-rating/bean-rating';
import { MethodIcon } from '../../shared/method-icon/method-icon';

@Component({
  selector: 'app-brew-card',
  imports: [MatCardModule, BeanRating, MethodIcon],
  templateUrl: './brew-card.html',
  styleUrl: './brew-card.scss',
})
export class BrewCard {
  brew = input.required<Brew>();
  highlighted = input(false);

  protected readonly date = computed(() => formatDate(this.brew().brewDate));
}
