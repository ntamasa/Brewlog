import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BrewPage, BrewQuery } from './models';

@Injectable({ providedIn: 'root' })
export class BrewApi {
  private readonly http = inject(HttpClient);

  list(query: BrewQuery): Observable<BrewPage> {
    const q = query.q.trim();
    let params = new HttpParams();
    if (q !== '') {
      params = params.set('q', q);
    }
    if (query.methodId !== null) {
      params = params.set('methodId', query.methodId);
    }
    if (query.roast !== null) {
      params = params.set('roast', query.roast);
    }
    if (query.minRating !== null) {
      params = params.set('minRating', query.minRating);
    }
    params = params.set('sort', query.sort).set('page', query.page);
    return this.http.get<BrewPage>('/api/brews', { params });
  }
}
