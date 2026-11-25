import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-method-icon',
  imports: [MatIconModule],
  template: `<mat-icon class="icon icon-lg" [svgIcon]="iconKey()" aria-hidden="true" />`,
  styleUrl: './method-icon.scss',
})
export class MethodIcon {
  iconKey = input.required<string>();
}
