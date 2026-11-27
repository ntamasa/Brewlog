import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ToastData } from './toast';
import { ToastMessage } from './toast-message';

async function render(
  data: ToastData,
): Promise<{ fixture: ComponentFixture<ToastMessage>; loader: HarnessLoader }> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: MAT_SNACK_BAR_DATA, useValue: data },
    ],
  });
  const fixture = TestBed.createComponent(ToastMessage);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, loader: TestbedHarnessEnvironment.loader(fixture) };
}

describe('ToastMessage', () => {
  it('shows the text after exactly one check icon, hidden from assistive tech, inside the snack bar label', async () => {
    const { fixture, loader } = await render({ text: 'Brew deleted', icon: 'check' });
    const label: HTMLElement = fixture.nativeElement.querySelector('[matSnackBarLabel]');

    expect(label.textContent?.trim()).toBe('Brew deleted');
    const icons = await loader.getAllHarnesses(MatIconHarness);
    expect(icons.length).toBe(1);
    expect(await icons[0].getName()).toBe('check');
    const icon = label.querySelector('mat-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the refresh icon and no check icon for the method-gone message', async () => {
    const { fixture, loader } = await render({
      text: 'That method no longer exists. The list has been refreshed.',
      icon: 'refresh',
    });

    const icons = await loader.getAllHarnesses(MatIconHarness);
    expect(icons.length).toBe(1);
    expect(await icons[0].getName()).toBe('refresh');
    expect(fixture.nativeElement.querySelector('mat-icon[data-mat-icon-name="check"]')).toBeNull();
  });
});
