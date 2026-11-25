import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { brewCount } from '../../core/format';
import { BrewCard } from '../brew-card/brew-card';
import { queryFromParams, queryToParams } from '../journal-query';
import { JournalStore } from '../journal.store';
import { Pagination } from '../pagination/pagination';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-journal-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, BrewCard, Pagination],
  templateUrl: './journal-page.html',
  styleUrl: './journal-page.scss',
})
export class JournalPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(JournalStore);
  protected readonly skeletonCards: readonly number[] = [1, 2, 3, 4, 5, 6];

  protected readonly countText = computed(() => brewCount(this.store.totalCount()));
  protected readonly footerText = computed(() => {
    const first = (this.store.page() - 1) * PAGE_SIZE + 1;
    const last = first + this.store.items().length - 1;
    return `Showing ${first}–${last} of ${this.store.matchingCount()}`;
  });

  ngOnInit(): void {
    this.store.setQuery(queryFromParams(this.route.snapshot.queryParamMap));
  }

  protected onPageChange(page: number): void {
    this.store.setPage(page);
    this.router.navigate([], { queryParams: queryToParams(this.store.query()) });
  }
}
