import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MethodApi } from '../core/method-api';
import { BrewMethod } from '../core/models';

interface MethodState {
  methods: BrewMethod[];
  status: 'idle' | 'loading' | 'ready' | 'error';
}

export const MethodStore = signalStore(
  { providedIn: 'root' },
  withState<MethodState>({ methods: [], status: 'idle' }),
  withMethods((store) => {
    const api = inject(MethodApi);

    return {
      load(): void {
        patchState(store, { status: 'loading' });
        api.list().subscribe({
          next: (methods) => patchState(store, { methods, status: 'ready' }),
          error: () => patchState(store, { status: 'error' }),
        });
      },
    };
  }),
);
