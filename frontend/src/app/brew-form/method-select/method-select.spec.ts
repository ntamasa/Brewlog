import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BrewMethod } from '../../core/models';
import { MethodSelect } from './method-select';

function method(id: number, name: string, iconKey: string, isProtected = false): BrewMethod {
  return { id, name, iconKey, predefined: id !== 8, protected: isProtected, position: id, brewCount: 0 };
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
  template: `<app-method-select [formControl]="control" [methods]="methods" />`,
})
class MethodHost {
  readonly control = new FormControl<number | null>(null);
  readonly methods = METHODS;
}

describe('MethodSelect', () => {
  let fixture: ComponentFixture<MethodHost>;
  let host: MethodHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MethodHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
});
