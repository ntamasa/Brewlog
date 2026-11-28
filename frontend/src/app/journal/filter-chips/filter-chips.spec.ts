import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrewQuery, DEFAULT_QUERY } from '../../core/models';
import { vi } from 'vitest';
import { FilterChips } from './filter-chips';

async function render(query: BrewQuery): Promise<ComponentFixture<FilterChips>> {
  const fixture = TestBed.createComponent(FilterChips);
  fixture.componentRef.setInput('query', query);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function buttonWithText(element: HTMLElement, text: string): HTMLButtonElement {
  const found = Array.from<HTMLButtonElement>(element.querySelectorAll('button')).find(
    (b) => b.textContent.trim() === text,
  );
  if (!found) {
    throw new Error(`no button "${text}"`);
  }
  return found;
}

describe('FilterChips', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('shows the trimmed search as one chip, and emits remove("q") and clearAll on its buttons', async () => {
    const fixture = await render({ ...DEFAULT_QUERY, q: '  kenya ' });
    const element: HTMLElement = fixture.nativeElement;
    const remove = vi.fn();
    const clearAll = vi.fn();
    fixture.componentInstance.remove.subscribe(remove);
    fixture.componentInstance.clearAll.subscribe(clearAll);

    const chips = element.querySelectorAll('.chip');
    expect(chips).toHaveLength(1);
    expect(chips[0].textContent).toContain('“kenya”');
    expect(buttonWithText(element, 'Clear all')).toBeTruthy();

    element.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]')!.click();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('q');

    buttonWithText(element, 'Clear all').click();
    expect(clearAll).toHaveBeenCalledTimes(1);
  });

  it('renders no chips row, chip or button without an active search', async () => {
    const fixture = await render(DEFAULT_QUERY);
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.chips-row')).toBeNull();
    expect(element.querySelector('.chip')).toBeNull();
    expect(element.querySelector('button')).toBeNull();
  });
});
