import { ApplicationInitStatus, provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { registerIcons } from './icons';

const SPRITE =
  '<svg><defs><symbol id="logo" viewBox="0 0 24 24"><circle r="1"/></symbol></defs></svg>';

describe('icon registration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAppInitializer(registerIcons),
      ],
    });
  });

  it('loads the sprite once and resolves a registered icon to an SVG element', async () => {
    await TestBed.inject(ApplicationInitStatus).donePromise;
    const http = TestBed.inject(HttpTestingController);
    const registry = TestBed.inject(MatIconRegistry);

    let icon: SVGElement | undefined;
    registry.getNamedSvgIcon('logo').subscribe((svg) => (icon = svg));

    http.expectOne('icons.svg').flush(SPRITE);
    http.verify();

    expect(icon).toBeInstanceOf(SVGElement);
    expect(icon?.querySelector('circle')).not.toBeNull();
  });

  it('errors with the icon name when the sprite has no such icon', async () => {
    await TestBed.inject(ApplicationInitStatus).donePromise;
    const http = TestBed.inject(HttpTestingController);
    const registry = TestBed.inject(MatIconRegistry);

    let error: unknown;
    registry.getNamedSvgIcon('no-such-icon').subscribe({
      error: (e: unknown) => (error = e),
    });

    http.expectOne('icons.svg').flush(SPRITE);
    http.verify();

    expect(String(error)).toContain('no-such-icon');
  });
});
