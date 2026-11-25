import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
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
