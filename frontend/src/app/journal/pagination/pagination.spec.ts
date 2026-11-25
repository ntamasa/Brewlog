import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

function render(page: number, totalPages: number): ComponentFixture<Pagination> {
  const fixture = TestBed.createComponent(Pagination);
  fixture.componentRef.setInput('page', page);
  fixture.componentRef.setInput('totalPages', totalPages);
  fixture.detectChanges();
  return fixture;
}

function button(fixture: ComponentFixture<Pagination>, text: string): HTMLButtonElement {
  const found = Array.from<HTMLButtonElement>(
    fixture.nativeElement.querySelectorAll('button'),
  ).find((b) => b.textContent.trim() === text);
  if (!found) {
    throw new Error(`no button "${text}"`);
  }
  return found;
}

describe('Pagination', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('shows every page number, marks the current page and enables only the valid arrows', () => {
    const fixture = render(1, 4);

    for (const label of ['1', '2', '3', '4']) {
      expect(button(fixture, label)).toBeTruthy();
    }
    expect(button(fixture, '1').getAttribute('aria-current')).toBe('page');
    expect(button(fixture, '‹').disabled).toBe(true);
    expect(button(fixture, '›').disabled).toBe(false);
  });

  it('emits the clicked page number', () => {
    const fixture = render(2, 4);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));

    button(fixture, '3').click();

    expect(emitted).toEqual([3]);
  });

  it('emits the next page when the next arrow is clicked', () => {
    const fixture = render(2, 4);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));

    button(fixture, '›').click();

    expect(emitted).toEqual([3]);
  });

  it('emits the previous page when the previous arrow is clicked', () => {
    const fixture = render(2, 4);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((p) => emitted.push(p));

    button(fixture, '‹').click();

    expect(emitted).toEqual([1]);
  });

  it('disables the next arrow on the last page', () => {
    const fixture = render(4, 4);

    expect(button(fixture, '›').disabled).toBe(true);
  });

  it('renders nothing when there is only one page', () => {
    const fixture = render(1, 1);

    expect(fixture.nativeElement.querySelectorAll('button')).toHaveLength(0);
  });
});
