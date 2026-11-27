import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessage } from './toast-message';

export type ToastIcon = 'check' | 'refresh';

export interface ToastData {
  text: string;
  icon: ToastIcon;
}

@Injectable({ providedIn: 'root' })
export class Toaster {
  private readonly snackBar = inject(MatSnackBar);

  show(text: string, icon: ToastIcon = 'check'): void {
    this.snackBar.openFromComponent(ToastMessage, { data: { text, icon }, duration: 4000 });
  }
}
