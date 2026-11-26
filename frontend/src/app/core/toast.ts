import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class Toaster {
  private readonly snackBar = inject(MatSnackBar);

  show(text: string): void {
    this.snackBar.open(text, undefined, { duration: 4000 });
  }
}
