import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BrewMethod } from './models';

@Injectable({ providedIn: 'root' })
export class MethodApi {
  private readonly http = inject(HttpClient);

  list(): Observable<BrewMethod[]> {
    return this.http.get<BrewMethod[]>('/api/methods');
  }
}
