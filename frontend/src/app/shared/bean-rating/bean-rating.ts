import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const BEAN_COUNT = 5;

@Component({
  selector: 'app-bean-rating',
  imports: [MatIconModule],
  templateUrl: './bean-rating.html',
  styleUrl: './bean-rating.scss',
})
export class BeanRating {
  value = input<number | null>(null);

  protected readonly score = computed(() => this.value() ?? 0);
  protected readonly beans = computed(() =>
    Array.from({ length: BEAN_COUNT }, (_, i) => i < this.score()),
  );
  protected readonly label = computed(() => `${this.score()} of ${BEAN_COUNT} beans`);
}
