import { Component, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { OfferCardComponent } from '@features/offers/ui/offer-card/offer-card.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';

/**
 * Main page for browsing marketplace offers with infinite scroll.
 */
@Component({
  selector: 'offer-list-page',
  imports: [OfferCardComponent, LoadingSpinnerComponent],
  templateUrl: './offer-list-page.component.html',
  styleUrl: './offer-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferListPageComponent {
  private readonly store = inject(OffersStore);

  offers = this.store.offers;
  loading = this.store.loading;
  hasMore = this.store.hasMore;
  error = this.store.error;

  /**
   * Loads next page when user scrolls within 200px of document bottom.
   */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200; // Load when 200px from bottom

    if (scrollPosition >= documentHeight - threshold) {
      this.loadMore();
    }
  }

  loadMore(): void {
    this.store.loadNextPage();
  }

  getUserVote(offerId: string): number {
    return this.store.getUserVote(offerId);
  }

  onUpvote(offerId: string): void {
    this.store.upvote(offerId);
  }

  onDownvote(offerId: string): void {
    this.store.downvote(offerId);
  }
}
