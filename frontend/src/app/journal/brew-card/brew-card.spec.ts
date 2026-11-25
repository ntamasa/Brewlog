import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { Brew } from '../../core/models';
import { BrewCard } from './brew-card';

const KENYAN_MORNING: Brew = {
  id: 1,
  name: 'Kenyan Morning',
  beanName: 'AA Kiambu',
  origin: 'Kenya',
  method: { id: 2, name: 'Pour Over', iconKey: 'pour-over' },
  roast: 'LIGHT',
  rating: 5,
  brewDate: '2026-10-28',
  notes: 'Bright and juicy',
};

async function render(brew: Brew, highlighted = false): Promise<ComponentFixture<BrewCard>> {
  const fixture = TestBed.createComponent(BrewCard);
  fixture.componentRef.setInput('brew', brew);
  fixture.componentRef.setInput('highlighted', highlighted);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function iconNames(loader: HarnessLoader): Promise<string[]> {
  const icons = await loader.getAllHarnesses(MatIconHarness);
  return Promise.all(icons.map((icon) => icon.getName() as Promise<string>));
}

describe('BrewCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('shows the method, brew name, bean and origin, rating, roast, notes and date', async () => {
    const fixture = await render(KENYAN_MORNING);
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Pour Over');
    expect(text).toContain('Kenyan Morning');
    expect(text).toContain('AA Kiambu · Kenya');
    expect(text).toContain('LIGHT');
    expect(text).toContain('Bright and juicy');
    expect(text).toContain('28 Oct 2026');
    expect(fixture.nativeElement.querySelector('[aria-label="5 of 5 beans"]')).not.toBeNull();
    expect(await iconNames(TestbedHarnessEnvironment.loader(fixture))).toContain('pour-over');
  });

  it('adds the highlight class when highlighted', async () => {
    const fixture = await render(KENYAN_MORNING, true);

    expect(fixture.nativeElement.querySelector('.brew-card-highlight')).not.toBeNull();
  });

  it('shows "No tasting notes" when the brew has no notes', async () => {
    const fixture = await render({ ...KENYAN_MORNING, notes: null });

    expect(fixture.nativeElement.textContent).toContain('No tasting notes');
  });

  it('uses the generic cup icon for a custom method', async () => {
    const fixture = await render({
      ...KENYAN_MORNING,
      method: { id: 9, name: 'Siphon', iconKey: 'cup' },
    });

    expect(await iconNames(TestbedHarnessEnvironment.loader(fixture))).toContain('cup');
  });
});
