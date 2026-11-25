import { ApplicationInitStatus, provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { routes } from '../../app.routes';
import { registerIcons } from '../../core/icons';

async function render(url = '/'): Promise<RouterTestingHarness> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideAppInitializer(registerIcons),
    ],
  });
  await TestBed.inject(ApplicationInitStatus).donePromise;
  return RouterTestingHarness.create(url);
}

function el(harness: RouterTestingHarness): HTMLElement {
  const root = harness.routeNativeElement;
  if (!root) throw new Error('landing page not rendered');
  return root;
}

function click(harness: RouterTestingHarness, selector: string, text: string): void {
  const match = Array.from(el(harness).querySelectorAll<HTMLElement>(selector)).find((e) =>
    e.textContent?.includes(text),
  );
  if (!match) throw new Error(`no ${selector} with text "${text}"`);
  match.click();
}

describe('landing page', () => {
  it('shows the hero, section and closing headings (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const text = el(harness).textContent ?? '';

    expect(text).toContain('Remember every cup worth remembering.');
    expect(text).toContain('A ledger for the cups you love.');
    expect(text).toContain('Brew. Log. Rediscover.');
    expect(text).toContain('Your next great cup starts with the last one.');
  });

  it('shows the three local photos with alt text and the photo credits in the footer (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const root = el(harness);

    const sources = Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src'));
    for (const file of ['hero-pour-over.jpg', 'beans.jpg', 'cup-notebook.jpg']) {
      const src = sources.find((s) => s?.endsWith(file));
      expect(src, file).toBeDefined();
      const img = Array.from(root.querySelectorAll('img')).find(
        (i) => i.getAttribute('src') === src,
      );
      expect(img?.getAttribute('alt')?.trim().length ?? 0).toBeGreaterThan(0);
    }

    const footer = root.querySelector('footer')?.textContent ?? '';
    expect(footer).toContain('Nadia Valko');
    expect(footer).toContain('Mona Jain');
    expect(footer).toContain('Andres Molina');
  });

  it('navigates to /journal from the hero, the nav and the closing CTA (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const router = TestBed.inject(Router);

    click(harness, '.hero a', 'Open my journal');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/journal');

    await harness.navigateByUrl('/');
    click(harness, '.hero-nav a', 'Open journal');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/journal');

    await harness.navigateByUrl('/');
    click(harness, '.closing a', 'Open my journal');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/journal');
  });

  it('"How it works" goes to /#how and the section with id "how" exists (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const router = TestBed.inject(Router);

    click(harness, '.hero a', 'How it works');
    await harness.fixture.whenStable();

    expect(router.url).toBe('/#how');
    expect(el(harness).querySelector('#how')).not.toBeNull();
  });

  it('gives the CTAs their Material appearances and classes (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(harness.fixture);

    const hero = await loader.getHarness(
      MatButtonHarness.with({ ancestor: '.hero', text: 'Open my journal' }),
    );
    expect(await hero.getAppearance()).toBe('filled');
    expect(await (await hero.host()).hasClass('btn-accent')).toBe(true);

    const how = await loader.getHarness(MatButtonHarness.with({ text: 'How it works' }));
    expect(await how.getAppearance()).toBe('outlined');
    expect(await (await how.host()).hasClass('btn-on-scrim')).toBe(true);

    const closing = await loader.getHarness(MatButtonHarness.with({ ancestor: '.closing' }));
    expect(await closing.getAppearance()).toBe('filled');
    expect(await (await closing.host()).hasClass('btn-accent')).toBe(false);
    const arrow = el(harness).querySelector('.closing mat-icon');
    expect(arrow?.getAttribute('data-mat-icon-name')).toBe('arrow-right');
    expect(arrow?.hasAttribute('iconPositionEnd')).toBe(true);
  });

  it('keeps the URL at / when the brand mark is clicked (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const router = TestBed.inject(Router);

    click(harness, 'a.brand', 'Brewlog');
    await harness.fixture.whenStable();

    expect(router.url).toBe('/');
  });

  it('has exactly 3 Material buttons and none of the prototype button classes (R1)', async () => {
    const harness = await render('/');
    await harness.fixture.whenStable();
    const root = el(harness);

    expect(root.querySelectorAll('.mdc-button').length).toBe(3);
    for (const cls of ['btn', 'btn-primary', 'btn-ghost', 'icon-btn', 'fab']) {
      expect(root.querySelector(`.${cls}`), cls).toBeNull();
    }
  });
});
