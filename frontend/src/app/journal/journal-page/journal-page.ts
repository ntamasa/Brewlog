import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BrewForm } from '../../brew-form/brew-form';
import { brewCount } from '../../core/format';
import { Brew } from '../../core/models';
import { Toaster } from '../../core/toast';
import { MethodStore } from '../../methods/method.store';
import { BrewCard } from '../brew-card/brew-card';
import { queryFromParams, queryToParams } from '../journal-query';
import { JournalStore } from '../journal.store';
import { Pagination } from '../pagination/pagination';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-journal-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    BrewForm,
    BrewCard,
    Pagination,
  ],
  templateUrl: './journal-page.html',
  styleUrl: './journal-page.scss',
})
export class JournalPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);
  protected readonly store = inject(JournalStore);
  protected readonly methodStore = inject(MethodStore);
  protected readonly sidenav = viewChild.required(MatSidenav);
  protected readonly formOpen = signal(false);
  protected readonly skeletonCards: readonly number[] = [1, 2, 3, 4, 5, 6];

  protected readonly countText = computed(() => brewCount(this.store.totalCount()));
  protected readonly isEmpty = computed(
    () => this.store.status() === 'ready' && this.store.totalCount() === 0,
  );
  protected readonly footerText = computed(() => {
    const first = (this.store.page() - 1) * PAGE_SIZE + 1;
    const last = first + this.store.items().length - 1;
    return `Showing ${first}–${last} of ${this.store.matchingCount()}`;
  });

  ngOnInit(): void {
    this.store.setQuery(queryFromParams(this.route.snapshot.queryParamMap));
  }

  protected openCreate(): void {
    if (this.methodStore.status() === 'idle') this.methodStore.load();
    this.formOpen.set(true);
    void this.sidenav().open();
  }

  protected onFormClosed(): void {
    void this.sidenav().close();
  }

  protected onSaved(brew: Brew): void {
    void this.sidenav().close();
    this.toaster.show(`“${brew.name}” saved to your journal`);
    this.store.highlight(brew.id);
    this.store.reload();
  }

  protected onPageChange(page: number): void {
    this.store.setPage(page);
    this.router.navigate([], { queryParams: queryToParams(this.store.query()) });
  }
}
