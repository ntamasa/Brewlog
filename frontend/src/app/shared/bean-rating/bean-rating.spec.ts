import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconHarness } from '@angular/material/icon/testing';
import { vi } from 'vitest';
import { BeanRating } from './bean-rating';

async function iconNames(loader: HarnessLoader): Promise<string[]> {
  const icons = await loader.getAllHarnesses(MatIconHarness);
  return Promise.all(icons.map((icon) => icon.getName() as Promise<string>));
}

describe('BeanRating', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('fills as many beans as the value and labels the score', async () => {
    const fixture = TestBed.createComponent(BeanRating);
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();

    const names = await iconNames(TestbedHarnessEnvironment.loader(fixture));

    expect(names.filter((name) => name === 'bean-fill')).toHaveLength(3);
    expect(names.filter((name) => name === 'bean')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('[aria-label="3 of 5 beans"]')).not.toBeNull();
  });
});

@Component({
  imports: [BeanRating, ReactiveFormsModule],
  template: `<app-bean-rating mode="input" [formControl]="control" />`,
})
class RatingHost {
  readonly control = new FormControl<number | null>(null);
}

function radios(root: HTMLElement): HTMLInputElement[] {
  return Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
}

function press(radio: HTMLInputElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  radio.dispatchEvent(event);
  return event;
}

// The visible score text ("4 of 5" or "Not rated"), not the screen-reader labels ("4 of 5 beans").
function shownScore(root: HTMLElement): string | undefined {
  return Array.from(root.querySelectorAll<HTMLElement>('*'))
    .filter((el) => el.childElementCount === 0)
    .map((el) => (el.textContent ?? '').trim())
    .find((text) => /^(\d of 5|Not rated)$/.test(text));
}

describe('BeanRating in input mode', () => {
  let fixture: ComponentFixture<RatingHost>;
  let host: RatingHost;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(RatingHost);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  function setRating(value: number | null): void {
    host.control.setValue(value);
    fixture.detectChanges();
  }

  it('clicking the 4th bean sets 4, fills 4 beans and reads 4 of 5', async () => {
    radios(root)[3].click();
    fixture.detectChanges();

    expect(host.control.value).toBe(4);
    const names = await iconNames(TestbedHarnessEnvironment.loader(fixture));
    expect(names.filter((name) => name === 'bean-fill')).toHaveLength(4);
    expect(shownScore(root)).toBe('4 of 5');
  });

  it('with no rating, no bean is checked, the text reads Not rated and only bean 1 is a Tab stop', () => {
    expect(radios(root).some((radio) => radio.checked)).toBe(false);
    expect(shownScore(root)).toBe('Not rated');
    const tabStops = radios(root).map((radio) => radio.tabIndex);
    expect(tabStops).toEqual([0, -1, -1, -1, -1]);
  });

  it('from Not rated, ArrowRight checks bean 1 and reads 1 of 5, and the key is handled', () => {
    const bean1 = radios(root)[0];
    bean1.focus();

    const event = press(bean1, 'ArrowRight');
    fixture.detectChanges();

    expect(host.control.value).toBe(1);
    expect(radios(root)[0].checked).toBe(true);
    expect(shownScore(root)).toBe('1 of 5');
    expect(event.defaultPrevented).toBe(true);
  });

  it('from Not rated, ArrowUp checks bean 1 and reads 1 of 5', () => {
    const bean1 = radios(root)[0];
    bean1.focus();

    press(bean1, 'ArrowUp');
    fixture.detectChanges();

    expect(host.control.value).toBe(1);
    expect(shownScore(root)).toBe('1 of 5');
  });

  it('from Not rated, Space on bean 1 checks it and reads 1 of 5', () => {
    const bean1 = radios(root)[0];
    bean1.focus();

    press(bean1, ' ');
    fixture.detectChanges();

    expect(host.control.value).toBe(1);
    expect(shownScore(root)).toBe('1 of 5');
  });

  it('at 4, only bean 4 is a Tab stop, and ArrowRight checks 5 and moves focus to it', () => {
    setRating(4);
    expect(radios(root).map((radio) => radio.tabIndex)).toEqual([-1, -1, -1, 0, -1]);

    const bean4 = radios(root)[3];
    bean4.focus();
    press(bean4, 'ArrowRight');
    fixture.detectChanges();

    expect(host.control.value).toBe(5);
    expect(shownScore(root)).toBe('5 of 5');
    expect(document.activeElement).toBe(radios(root)[4]);
    expect(radios(root)[4].tabIndex).toBe(0);
  });

  it('at 4, ArrowUp checks 5 and moves focus to it', () => {
    setRating(4);
    const bean4 = radios(root)[3];
    bean4.focus();

    press(bean4, 'ArrowUp');
    fixture.detectChanges();

    expect(host.control.value).toBe(5);
    expect(document.activeElement).toBe(radios(root)[4]);
  });

  it('at 4, ArrowLeft checks 3 and moves focus to it', () => {
    setRating(4);
    const bean4 = radios(root)[3];
    bean4.focus();

    press(bean4, 'ArrowLeft');
    fixture.detectChanges();

    expect(host.control.value).toBe(3);
    expect(shownScore(root)).toBe('3 of 5');
    expect(document.activeElement).toBe(radios(root)[2]);
  });

  it('at 4, ArrowDown checks 3 and moves focus to it', () => {
    setRating(4);
    const bean4 = radios(root)[3];
    bean4.focus();

    press(bean4, 'ArrowDown');
    fixture.detectChanges();

    expect(host.control.value).toBe(3);
    expect(document.activeElement).toBe(radios(root)[2]);
  });

  it('when focus leaves the group, the control is marked touched', () => {
    radios(root)[0].focus();

    radios(root)[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));

    expect(host.control.touched).toBe(true);
  });

  it('at Not rated, ArrowLeft and ArrowDown keep it unrated without emitting', () => {
    const spy = vi.fn();
    host.control.valueChanges.subscribe(spy);
    const bean1 = radios(root)[0];

    for (const key of ['ArrowLeft', 'ArrowDown']) {
      bean1.focus();
      const event = press(bean1, key);
      fixture.detectChanges();

      expect(host.control.value).toBeNull();
      expect(shownScore(root)).toBe('Not rated');
      expect(document.activeElement).toBe(bean1);
      expect(event.defaultPrevented).toBe(true);
    }
    expect(spy).not.toHaveBeenCalled();
  });

  it('at 5, ArrowRight and ArrowUp keep 5 without emitting and do not wrap', () => {
    setRating(5);
    const spy = vi.fn();
    host.control.valueChanges.subscribe(spy);
    const bean5 = radios(root)[4];

    for (const key of ['ArrowRight', 'ArrowUp']) {
      bean5.focus();
      const event = press(bean5, key);
      fixture.detectChanges();

      expect(host.control.value).toBe(5);
      expect(event.defaultPrevented).toBe(true);
    }
    expect(spy).not.toHaveBeenCalled();
  });

  it('at 1, ArrowLeft and ArrowDown keep 1 without emitting, never back to Not rated', () => {
    setRating(1);
    const spy = vi.fn();
    host.control.valueChanges.subscribe(spy);
    const bean1 = radios(root)[0];

    for (const key of ['ArrowLeft', 'ArrowDown']) {
      bean1.focus();
      const event = press(bean1, key);
      fixture.detectChanges();

      expect(host.control.value).toBe(1);
      expect(event.defaultPrevented).toBe(true);
    }
    expect(spy).not.toHaveBeenCalled();
  });

  it('Tab on bean 4 is not prevented and leaves the control at 4', () => {
    setRating(4);
    const bean4 = radios(root)[3];
    bean4.focus();

    const event = press(bean4, 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(host.control.value).toBe(4);
  });

  it('a disabled control disables all 5 bean radios', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(radios(root).every((radio) => radio.disabled)).toBe(true);
    expect(radios(root)).toHaveLength(5);
  });
});
