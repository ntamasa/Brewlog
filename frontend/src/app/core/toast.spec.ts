import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { Toaster } from './toast';

describe('Toaster.show', () => {
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: MatSnackBar, useValue: snackBar }] });
  });

  it('opens the snack bar with the text and shows it for 4000 ms', () => {
    TestBed.inject(Toaster).show('“Kenyan Morning” saved to your journal');

    expect(snackBar.open).toHaveBeenCalledWith(
      '“Kenyan Morning” saved to your journal',
      undefined,
      {
        duration: 4000,
      },
    );
  });
});
