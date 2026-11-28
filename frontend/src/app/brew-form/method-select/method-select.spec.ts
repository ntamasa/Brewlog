import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BREWLOG_FORM_FIELD_OPTIONS } from '../../core/form-field-options';
import { BrewMethod } from '../../core/models';
import { MethodSelect } from './method-select';

function method(id: number, name: string, iconKey: string, isProtected = false): BrewMethod {
  return {
    id,
    name,
    iconKey,
    predefined: id !== 8,
    protected: isProtected,
    position: id,
    brewCount: 0,
  };
}

const METHODS: BrewMethod[] = [
  method(1, 'Espresso', 'espresso'),
  method(2, 'Pour Over', 'pour-over'),
  method(3, 'French Press', 'french-press'),
  method(4, 'AeroPress', 'aeropress'),
  method(5, 'Moka Pot', 'moka-pot'),
  method(6, 'Cold Brew', 'cold-brew'),
  method(8, 'chemex', 'cup'),
  method(99, 'Other', 'cup', true),
];

@Component({
  imports: [MethodSelect, ReactiveFormsModule],
  template: `<app-method-select [formControl]="control" [methods]="methods" [error]="error()" />`,
})
class MethodHost {
  readonly control = new FormControl<number | null>(null);
  readonly methods = METHODS;
  readonly error = signal<string | null>(null);
}

describe('MethodSelect', () => {
  let fixture: ComponentFixture<MethodHost>;
  let host: MethodHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MethodHost],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
      ],
    });
    fixture = TestBed.createComponent(MethodHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('lists the methods A-Z with Other last, and choosing Pour Over sets 2', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);

    await select.open();
    const names = await Promise.all((await select.getOptions()).map((option) => option.getText()));
    expect(names).toEqual([
      'AeroPress',
      'chemex',
      'Cold Brew',
      'Espresso',
      'French Press',
      'Moka Pot',
      'Pour Over',
      'Other',
    ]);

    await select.clickOptions({ text: 'Pour Over' });
    expect(host.control.value).toBe(2);
  });

  it('with no method chosen it shows Choose a method, and disabling the control disables the select', async () => {
    expect(host.control.value).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Choose a method');

    host.control.disable();
    fixture.detectChanges();

    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
    expect(await select.isDisabled()).toBe(true);
  });

  it('labels the field Brew method, and its chevron icon opens the select', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const label = fixture.nativeElement.querySelector('span.field-label#method-label');
    expect(label.textContent.trim()).toBe('Brew method');

    const select = fixture.nativeElement.querySelector('mat-select#method-btn');
    expect(select.getAttribute('aria-labelledby')).toContain('method-label');

    const chevron = await loader.getHarness(MatIconHarness.with({ name: 'chevron-down' }));
    await (await chevron.host()).click();
    expect(await (await loader.getHarness(MatSelectHarness)).isOpen()).toBe(true);
  });

  it('shows the chosen method icon before its name in the field', async () => {
    host.control.setValue(2);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.getValueText()).toBe('Pour Over');
    expect(await iconNames(loader, '#method-btn')).toEqual(['pour-over']);
  });

  it('shows the icon and name of a method chosen from the list', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);

    await select.clickOptions({ text: 'AeroPress' });

    expect(await select.getValueText()).toBe('AeroPress');
    expect(await iconNames(loader, '#method-btn')).toEqual(['aeropress']);
  });

  it('gives each option its icon, in A-Z order with Other last', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(MatSelectHarness)).open();

    const documentLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    expect(await iconNames(documentLoader, '.mat-mdc-select-panel')).toEqual([
      'aeropress',
      'cup',
      'cold-brew',
      'espresso',
      'french-press',
      'moka-pot',
      'pour-over',
      'cup',
    ]);
  });

  it('marks only the chosen option as selected, with no pseudo checkbox in the panel', async () => {
    host.control.setValue(2);
    fixture.detectChanges();
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);

    await select.open();

    const selected: string[] = [];
    for (const option of await select.getOptions()) {
      if (await option.isSelected()) {
        selected.push(await option.getText());
      }
    }
    expect(selected).toEqual(['Pour Over']);
    expect(panelPseudoCheckboxCount()).toBe(0);
  });

  it('with no method chosen, shows Choose a method and no icon, the chevron being the only icon in the field', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const select = await loader.getHarness(MatSelectHarness);
    expect(await select.getValueText()).toBe('Choose a method');
    expect(await iconNames(loader, '#method-btn')).toEqual([]);
    expect(await iconNames(loader, '[data-field="method"]')).toEqual(['chevron-down']);
  });

  it('with an id that is not in the list, shows Choose a method and no icon', async () => {
    host.control.setValue(42);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);

    expect(await (await loader.getHarness(MatSelectHarness)).getValueText()).toBe(
      'Choose a method',
    );
    expect(await iconNames(loader, '#method-btn')).toEqual([]);
  });

  it('with no method chosen, no option is selected and the panel has no pseudo checkbox', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);

    await select.open();

    for (const option of await select.getOptions()) {
      expect(await option.isSelected()).toBe(false);
    }
    expect(panelPseudoCheckboxCount()).toBe(0);
  });

  it('with the error "Choose a brew method", the form field shows the error state and that message', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const formField = await loader.getHarness(MatFormFieldHarness);

    host.error.set('Choose a brew method');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(await (await formField.host()).hasClass('mat-form-field-invalid')).toBe(true);
    expect(await formField.getTextErrors()).toEqual(['Choose a brew method']);
  });

  it('when the error is set back to null, the form field loses the error state and its message', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const formField = await loader.getHarness(MatFormFieldHarness);
    host.error.set('Choose a brew method');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(await (await formField.host()).hasClass('mat-form-field-invalid')).toBe(true);

    host.error.set(null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(await (await formField.host()).hasClass('mat-form-field-invalid')).toBe(false);
    expect(await formField.getTextErrors()).toEqual([]);
  });
});

async function iconNames(loader: HarnessLoader, ancestor: string): Promise<(string | null)[]> {
  const icons = await loader.getAllHarnesses(MatIconHarness.with({ ancestor }));
  return Promise.all(icons.map((icon) => icon.getName()));
}

function panelPseudoCheckboxCount(): number {
  return document.querySelectorAll(
    '.mat-mdc-select-panel .mat-pseudo-checkbox, .mat-mdc-select-panel mat-pseudo-checkbox',
  ).length;
}
