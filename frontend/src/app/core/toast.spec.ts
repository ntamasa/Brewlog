import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { type Mock, vi } from 'vitest';
import { Toaster } from './toast';
import { ToastMessage } from './toast-message';

describe('Toaster.show', () => {
  let snackBar: { open: Mock; openFromComponent: Mock };

  beforeEach(() => {
    snackBar = { open: vi.fn(), openFromComponent: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: MatSnackBar, useValue: snackBar }] });
  });

  it('opens a ToastMessage with the check icon by default and shows it for 4000 ms', () => {
    TestBed.inject(Toaster).show('“Kenyan Morning” saved to your journal');

    expect(snackBar.openFromComponent).toHaveBeenCalledTimes(1);
    expect(snackBar.openFromComponent).toHaveBeenCalledWith(ToastMessage, {
      data: { text: '“Kenyan Morning” saved to your journal', icon: 'check' },
      duration: 4000,
    });
  });

  it('opens a ToastMessage with the refresh icon when given refresh, for 4000 ms', () => {
    TestBed.inject(Toaster).show(
      'That method no longer exists. The list has been refreshed.',
      'refresh',
    );

    expect(snackBar.openFromComponent).toHaveBeenCalledWith(ToastMessage, {
      data: { text: 'That method no longer exists. The list has been refreshed.', icon: 'refresh' },
      duration: 4000,
    });
  });

  it('does not open a plain-text snack bar', () => {
    TestBed.inject(Toaster).show('“Kenyan Morning” saved to your journal');

    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
