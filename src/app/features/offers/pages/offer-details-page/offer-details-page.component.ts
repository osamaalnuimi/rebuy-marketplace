import { Component, inject, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { VotingControlsComponent } from '@features/offers/ui/voting-controls/voting-controls.component';
import { PurchaseModalComponent } from '@features/offers/ui/purchase-modal/purchase-modal.component';
import { OfferImageComponent } from '@features/offers/ui/offer-image/offer-image.component';
import { OfferInfoComponent } from '@features/offers/ui/offer-info/offer-info.component';

/**
 * Displays detailed view of a single offer with purchase and voting capabilities.
 */
@Component({
  selector: 'offer-details-page',
  imports: [
    RouterLink,
    VotingControlsComponent,
    PurchaseModalComponent,
    OfferImageComponent,
    OfferInfoComponent,
    CurrencyPipe,
  ],
  templateUrl: './offer-details-page.component.html',
  styleUrl: './offer-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDetailsPageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(OffersStore);

  id = input.required<string>();
  showPurchaseModal = signal<boolean>(false);
  purchaseSuccess = signal<boolean>(false);

  offer = computed(() => {
    const offerId = this.id();
    return offerId ? this.store.getOfferById(offerId) : undefined;
  });

  userVote = computed(() => {
    const offer = this.offer();
    return offer ? this.store.getUserVote(offer.id) : 0;
  });

  onUpvote(): void {
    const offer = this.offer();
    if (offer) {
      this.store.upvote(offer.id);
    }
  }

  onDownvote(): void {
    const offer = this.offer();
    if (offer) {
      this.store.downvote(offer.id);
    }
  }

  openPurchaseModal(): void {
    this.showPurchaseModal.set(true);
  }

  closePurchaseModal(): void {
    this.showPurchaseModal.set(false);
    this.purchaseSuccess.set(false);
  }

  confirmPurchase(): void {
    this.purchaseSuccess.set(true);
    setTimeout(() => {
      this.closePurchaseModal();
      this.router.navigate(['/']);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
