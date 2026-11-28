import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { formatDate } from '../../core/format';
import { Brew } from '../../core/models';
import { BeanRating } from '../../shared/bean-rating/bean-rating';
import { MethodIcon } from '../../shared/method-icon/method-icon';

@Component({
  selector: 'app-brew-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatMenuModule, BeanRating, MethodIcon],
  templateUrl: './brew-card.html',
  styleUrl: './brew-card.scss',
})
export class BrewCard {
  brew = input.required<Brew>();
  highlighted = input(false);
  edit = output<Brew>();

  protected readonly date = computed(() => formatDate(this.brew().brewDate));
}
