import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { vi } from 'vitest';
import { BREWLOG_FORM_FIELD_OPTIONS } from '../../core/form-field-options';
import { BrewQuery, DEFAULT_QUERY } from '../../core/models';
import { JournalToolbar } from './journal-toolbar';

function render(query: BrewQuery): ComponentFixture<JournalToolbar> {
  const fixture = TestBed.createComponent(JournalToolbar);
  fixture.componentRef.setInput('query', query);
  fixture.detectChanges();
  return fixture;
}

describe('JournalToolbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: BREWLOG_FORM_FIELD_OPTIONS },
      ],
    });
  });

  it('labels the Search field and emits the typed text untrimmed', async () => {
    const fixture = render(DEFAULT_QUERY);
    const element: HTMLElement = fixture.nativeElement;
    const searchChange = vi.fn();
    fixture.componentInstance.searchChange.subscribe(searchChange);

    expect(element.querySelector('.toolbar')!.getAttribute('role')).toBe('search');
    expect(element.querySelector('label.field-label[for="q"]')!.textContent.trim()).toBe('Search');
    expect(element.querySelector<HTMLInputElement>('#q')!.placeholder).toBe('Search brew names');

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(MatInputHarness.with({ selector: '#q' }))).setValue('  kenya ');

    expect(searchChange).toHaveBeenLastCalledWith('  kenya ');
  });

  it('shows the query search text, and clears it without emitting when the query is reset', () => {
    const fixture = render({ ...DEFAULT_QUERY, q: 'kenya' });
    const element: HTMLElement = fixture.nativeElement;
    const searchChange = vi.fn();
    fixture.componentInstance.searchChange.subscribe(searchChange);

    expect(element.querySelector<HTMLInputElement>('#q')!.value).toBe('kenya');

    fixture.componentRef.setInput('query', DEFAULT_QUERY);
    fixture.detectChanges();

    expect(element.querySelector<HTMLInputElement>('#q')!.value).toBe('');
    expect(searchChange).not.toHaveBeenCalled();
  });

  it('labels the Sort select, shows Newest first and lists the four orders in order', async () => {
    const fixture = render(DEFAULT_QUERY);
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('span.field-label#f-sort-label')!.textContent.trim()).toBe('Sort');
    expect(element.querySelector('#f-sort')!.getAttribute('aria-labelledby')).toContain(
      'f-sort-label',
    );

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness.with({ selector: '#f-sort' }));
    expect(await select.getValueText()).toBe('Newest first');

    await select.open();
    const options = await select.getOptions();
    const texts = await Promise.all(options.map((option) => option.getText()));
    expect(texts).toEqual(['Newest first', 'Oldest first', 'Highest rated', 'Lowest rated']);
    await select.close();
  });

  it('emits HIGHEST when Highest rated is chosen', async () => {
    const fixture = render(DEFAULT_QUERY);
    const sort = vi.fn();
    fixture.componentInstance.sort.subscribe(sort);

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (
      await loader.getHarness(MatSelectHarness.with({ selector: '#f-sort' }))
    ).clickOptions({ text: 'Highest rated' });

    expect(sort).toHaveBeenLastCalledWith('HIGHEST');
  });
});
