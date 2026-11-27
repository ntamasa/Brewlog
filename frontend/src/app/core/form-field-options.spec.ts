import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { BREWLOG_FORM_FIELD_OPTIONS } from './form-field-options';

@Component({
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field>
      @if (withLabel) {
        <mat-label>Name</mat-label>
      }
      <input matInput required />
      <mat-hint>Help</mat-hint>
    </mat-form-field>
  `,
})
class FieldHost {
  withLabel = false;
}

describe('BREWLOG_FORM_FIELD_OPTIONS', () => {
  it('is outlined, dynamic subscript sizing and no required marker', () => {
    expect(BREWLOG_FORM_FIELD_OPTIONS).toEqual({
      appearance: 'outline',
      subscriptSizing: 'dynamic',
      hideRequiredMarker: true,
    });
  });
});

describe('BREWLOG_FORM_FIELD_OPTIONS on a form field', () => {
  let fixture: ComponentFixture<FieldHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FieldHost],
      providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
      ],
    });
    fixture = TestBed.createComponent(FieldHost);
    fixture.detectChanges();
  });

  it('renders an outlined field with its hint under dynamic subscript sizing', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const field = await loader.getHarness(MatFormFieldHarness);

    expect(await field.getAppearance()).toBe('outline');
    expect(await field.getTextHints()).toEqual(['Help']);
    expect(
      fixture.nativeElement.querySelector('.mat-mdc-form-field-subscript-dynamic-size'),
    ).not.toBeNull();
  });

  it('shows no required marker for a required input with a label', async () => {
    fixture.componentInstance.withLabel = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-mdc-form-field-required-marker')).toBeNull();
    expect(fixture.nativeElement.querySelector('input').required).toBe(true);
  });
});
