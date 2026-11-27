import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarLabel } from '@angular/material/snack-bar';
import type { ToastData } from './toast';

@Component({
  selector: 'app-toast-message',
  imports: [MatIconModule, MatSnackBarLabel],
  template: `<div matSnackBarLabel class="toast">
    <mat-icon class="icon icon-sm" [svgIcon]="data.icon" aria-hidden="true" />{{ data.text }}
  </div>`,
  styleUrl: './toast-message.scss',
})
export class ToastMessage {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
}
