import { Component, inject, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { VotingControlsComponent } from '@features/offers/ui/voting-controls/voting-controls.component';
import { PurchaseModalComponent } from '@features/offers/ui/purchase-modal/purchase-modal.component';

/**
 * Smart component for displaying detailed view of a single marketplace offer.
 *
 * @remarks
 * This page shows comprehensive offer information with voting, purchase, and navigation features.
 * Uses Angular's input signals for route parameters via withComponentInputBinding().
 *
 * Features:
 * - Full offer details with image, price, description, seller info
 * - Vote management (upvote/downvote with user vote status)
 * - Purchase flow with modal confirmation
 * - Navigation back to offer list
 * - OnPush change detection for optimal performance
 */
@Component({
  selector: 'offer-details-page',

  imports: [
    RouterLink,
    VotingControlsComponent,
    PurchaseModalComponent,
    CurrencyPipe,
    DatePipe,
    NgOptimizedImage,
  ],
  templateUrl: './offer-details-page.component.html',
  styleUrl: './offer-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDetailsPageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(OffersStore);

  /**
   * Route parameter (offer ID) automatically bound via withComponentInputBinding().
   * Required for fetching offer details from store.
   */
  id = input.required<string>();

  /** Controls visibility of purchase confirmation modal */
  showPurchaseModal = signal<boolean>(false);

  /** Tracks whether purchase was successfully confirmed */
  purchaseSuccess = signal<boolean>(false);

  /**
   * The current offer details fetched from store based on route ID.
   * Returns undefined if offer not found (e.g., not yet loaded).
   */
  offer = computed(() => {
    const offerId = this.id();
    return offerId ? this.store.getOfferById(offerId) : undefined;
  });

  /**
   * The current user's vote status for this offer.
   * Returns 1 for upvote, -1 for downvote, 0 for no vote.
   */
  userVote = computed(() => {
    const offer = this.offer();
    return offer ? this.store.getUserVote(offer.id) : 0;
  });

  /**
   * Handles upvote action for the current offer.
   * Toggles upvote if already upvoted, otherwise adds upvote.
   */
  onUpvote(): void {
    const offer = this.offer();
    if (offer) {
      this.store.upvote(offer.id);
    }
  }

  /**
   * Handles downvote action for the current offer.
   * Toggles downvote if already downvoted, otherwise adds downvote.
   */
  onDownvote(): void {
    const offer = this.offer();
    if (offer) {
      this.store.downvote(offer.id);
    }
  }

  /**
   * Opens the purchase confirmation modal.
   */
  openPurchaseModal(): void {
    this.showPurchaseModal.set(true);
  }

  /**
   * Closes the purchase modal and resets purchase state.
   */
  closePurchaseModal(): void {
    this.showPurchaseModal.set(false);
    this.purchaseSuccess.set(false);
  }

  /**
   * Confirms the purchase and shows success state.
   * Automatically navigates back to offer list after 2 seconds.
   */
  confirmPurchase(): void {
    this.purchaseSuccess.set(true);

    setTimeout(() => {
      this.closePurchaseModal();
      this.router.navigate(['/']);
    }, 2000);
  }

  /**
   * Navigates back to the main offer list page.
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
