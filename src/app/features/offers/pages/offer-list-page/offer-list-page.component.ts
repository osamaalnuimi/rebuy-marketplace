import { Component, inject, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { OfferCardComponent } from '@features/offers/ui/offer-card/offer-card.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';

/**
 * Smart component for displaying a scrollable list of marketplace offers.
 *
 * @remarks
 * This is the main page for browsing offers with infinite scroll functionality.
 * Connects to OffersStore for state management and delegates UI to OfferCardComponent.
 *
 * Features:
 * - Infinite scroll pagination (loads more when near bottom)
 * - Vote management (upvote/downvote)
 * - Loading states and error handling
 * - OnPush change detection for optimal performance
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

  /** All loaded offers sorted by votes (highest first) */
  offers = this.store.offers;

  /** Whether offers are currently being fetched from API */
  loading = this.store.loading;

  /** Whether more pages are available for infinite scroll */
  hasMore = this.store.hasMore;

  /** Error message from last failed request, if any */
  error = this.store.error;

  /**
   * Listens to window scroll events and triggers pagination when near bottom.
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

  /**
   * Triggers loading of the next page of offers if available.
   * Guards against loading when already fetching or no more data exists.
   */
  loadMore(): void {
    this.store.loadNextPage();
  }

  /**
   * Gets the current user's vote status for a specific offer.
   *
   * @param offerId - Unique offer identifier
   * @returns 1 for upvote, -1 for downvote, 0 for no vote
   */
  getUserVote(offerId: string): number {
    return this.store.getUserVote(offerId);
  }

  /**
   * Handles upvote action for an offer.
   * Toggles upvote if already upvoted, otherwise adds upvote.
   *
   * @param offerId - Unique offer identifier
   */
  onUpvote(offerId: string): void {
    this.store.upvote(offerId);
  }

  /**
   * Handles downvote action for an offer.
   * Toggles downvote if already downvoted, otherwise adds downvote.
   *
   * @param offerId - Unique offer identifier
   */
  onDownvote(offerId: string): void {
    this.store.downvote(offerId);
  }
}
