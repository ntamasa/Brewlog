import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MethodApi } from '../core/method-api';
import { BrewMethod } from '../core/models';
import { MethodStore } from './method.store';

function method(id: number, name: string, iconKey: string): BrewMethod {
  return { id, name, iconKey, predefined: true, protected: false, position: id, brewCount: 0 };
}

const SEVEN_METHODS: BrewMethod[] = [
  method(1, 'Espresso', 'espresso'),
  method(2, 'Pour Over', 'pour-over'),
  method(3, 'French Press', 'french-press'),
  method(4, 'AeroPress', 'aeropress'),
  method(5, 'Moka Pot', 'moka-pot'),
  method(6, 'Cold Brew', 'cold-brew'),
  method(99, 'Other', 'cup'),
];

describe('MethodStore.load', () => {
  let list: () => Observable<BrewMethod[]>;
  let store: InstanceType<typeof MethodStore>;

  function setUp(answer: () => Observable<BrewMethod[]>): void {
    list = vi.fn(answer);
    TestBed.configureTestingModule({ providers: [{ provide: MethodApi, useValue: { list } }] });
    store = TestBed.inject(MethodStore);
  }

  it('is ready with the loaded methods once the list arrives', () => {
    const answer = new Subject<BrewMethod[]>();
    setUp(() => answer);

    store.load();
    expect(store.status()).toBe('loading');

    answer.next(SEVEN_METHODS);
    expect(store.status()).toBe('ready');
    expect(store.methods()).toHaveLength(7);
  });

  it('is in error and keeps the methods it had when the request fails', () => {
    let answer: () => Observable<BrewMethod[]> = () => of(SEVEN_METHODS);
    setUp(() => answer());
    store.load();
    expect(store.status()).toBe('ready');

    answer = () => throwError(() => new HttpErrorResponse({ status: 0 }));
    store.load();

    expect(store.status()).toBe('error');
    expect(store.methods()).toEqual(SEVEN_METHODS);
  });
});
