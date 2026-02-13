import { Injectable, signal, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { Offer, UserVote, VoteType } from '@shared/data-access/models/offer.model';
import { OffersApiService } from '@shared/data-access/api/offers-api.service';

/**
 * Centralized state management store for marketplace offers.
 *
 * @remarks
 * This store uses Angular's signal-based reactive primitives and rxResource for HTTP streaming.
 * Provides infinite scroll pagination, optimistic updates, and localStorage persistence for user votes.
 *
 * Key features:
 * - Infinite scroll with automatic page accumulation
 * - Signal-based reactive state (no subscriptions needed)
 * - Optimistic UI updates with API synchronization
 * - User vote tracking persisted to localStorage
 * - Automatic subscription management via rxResource
 */
@Injectable({
  providedIn: 'root',
})
export class OffersStore {
  private readonly apiService = inject(OffersApiService);

  private readonly currentPage = signal(0);
  private readonly pageSize = 10;
  private readonly accumulatedOffers = signal<Offer[]>([]);
  private readonly userVotesSignal = signal<UserVote[]>(this.loadUserVotes());

  /**
   * rxResource automatically manages HTTP subscription lifecycle.
   * Triggers when currentPage changes and accumulates offers as side effect.
   */
  private readonly offersResource = rxResource({
    params: () => ({ page: this.currentPage() }),
    stream: ({ params }) => {
      return this.apiService.getOffers(params.page, this.pageSize).pipe(
        tap((response) => {
          this.accumulatedOffers.update((offers) => [...offers, ...response.offers]);
        }),
      );
    },
  });

  /**
   * All loaded offers sorted by votes (highest first).
   * Automatically recomputes when offers or votes change.
   */
  readonly offers = computed(() => {
    return [...this.accumulatedOffers()].sort((a, b) => b.votes - a.votes);
  });

  /**
   * Loading state from the HTTP resource.
   * True when fetching data from server.
   */
  readonly loading = computed(() => this.offersResource.isLoading());

  /**
   * Error message from the last failed request.
   * Null if no error occurred.
   */
  readonly error = computed(() => this.offersResource.error()?.message ?? null);

  /**
   * Whether more pages are available to load.
   * Used for infinite scroll to prevent unnecessary requests.
   */
  readonly hasMore = computed(() => {
    const resource = this.offersResource.value();
    return resource?.hasMore ?? true;
  });

  /**
   * All user votes (upvotes/downvotes) for offers.
   */
  readonly userVotes = computed(() => this.userVotesSignal());

  /**
   * Loads the next page of offers if not already loading and more data exists.
   * Accumulates results to existing offers array.
   */
  loadNextPage(): void {
    if (!this.loading() && this.hasMore()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  /**
   * Retrieves a single offer by ID from the accumulated offers.
   *
   * @param id - Unique offer identifier
   * @returns The offer if found, undefined otherwise
   */
  getOfferById(id: string): Offer | undefined {
    return this.accumulatedOffers().find((offer) => offer.id === id);
  }

  /**
   * Gets the current user's vote for a specific offer.
   *
   * @param offerId - Unique offer identifier
   * @returns 1 for upvote, -1 for downvote, 0 for no vote
   */
  getUserVote(offerId: string): VoteType | 0 {
    const vote = this.userVotesSignal().find((v) => v.offerId === offerId);
    return vote?.voteType ?? 0;
  }

  /**
   * Upvotes an offer with optimistic UI update and API synchronization.
   *
   * @param offerId - Unique offer identifier
   *
   * @remarks
   * Behavior:
   * - If already upvoted: removes vote (-1)
   * - If downvoted: changes to upvote (+2)
   * - If no vote: adds upvote (+1)
   *
   * Changes persist to localStorage and sync with API.
   * Supports rollback on API failure (see updateOfferVotes).
   */
  upvote(offerId: string): void {
    const currentVote = this.userVotesSignal().find((v) => v.offerId === offerId);

    if (currentVote?.voteType === 1) {
      this.removeVote(offerId);
      this.updateOfferVotes(offerId, -1);
    } else if (currentVote?.voteType === -1) {
      this.updateUserVote(offerId, 1);
      this.updateOfferVotes(offerId, 2);
    } else {
      this.addUserVote(offerId, 1);
      this.updateOfferVotes(offerId, 1);
    }

    this.saveUserVotes();
  }

  /**
   * Downvotes an offer with optimistic UI update and API synchronization.
   *
   * @param offerId - Unique offer identifier
   *
   * @remarks
   * Behavior:
   * - If already downvoted: removes vote (+1)
   * - If upvoted: changes to downvote (-2)
   * - If no vote: adds downvote (-1)
   *
   * Changes persist to localStorage and sync with API.
   * Supports rollback on API failure (see updateOfferVotes).
   */
  downvote(offerId: string): void {
    const currentVote = this.userVotesSignal().find((v) => v.offerId === offerId);

    if (currentVote?.voteType === -1) {
      this.removeVote(offerId);
      this.updateOfferVotes(offerId, 1);
    } else if (currentVote?.voteType === 1) {
      this.updateUserVote(offerId, -1);
      this.updateOfferVotes(offerId, -2);
    } else {
      this.addUserVote(offerId, -1);
      this.updateOfferVotes(offerId, -1);
    }

    this.saveUserVotes();
  }

  /**
   * Adds a new vote to the user's vote collection.
   * @private
   */
  private addUserVote(offerId: string, voteType: VoteType): void {
    this.userVotesSignal.update((votes) => [...votes, { offerId, voteType }]);
  }

  /**
   * Updates an existing vote's type.
   * @private
   */
  private updateUserVote(offerId: string, voteType: VoteType): void {
    this.userVotesSignal.update((votes) =>
      votes.map((v) => (v.offerId === offerId ? { ...v, voteType } : v)),
    );
  }

  /**
   * Removes a user's vote for a specific offer.
   * @private
   */
  private removeVote(offerId: string): void {
    this.userVotesSignal.update((votes) => votes.filter((v) => v.offerId !== offerId));
  }

  /**
   * Optimistically updates offer votes in local state and syncs with API.
   * Automatically rolls back changes if API call fails.
   *
   * @param offerId - Unique offer identifier
   * @param change - Vote change amount (positive for upvotes, negative for downvotes)
   * @private
   */
  private updateOfferVotes(offerId: string, change: number): void {
    // Optimistically update local state
    this.accumulatedOffers.update((offers) =>
      offers.map((offer) =>
        offer.id === offerId ? { ...offer, votes: offer.votes + change } : offer,
      ),
    );

    // Sync with API
    this.apiService.updateVote(offerId, change).subscribe({
      next: (response) => {
        console.log('Vote synced with API:', response);
      },
      error: (err) => {
        console.error('Failed to sync vote:', err);
        // Rollback the optimistic update
        this.accumulatedOffers.update((offers) =>
          offers.map((offer) =>
            offer.id === offerId ? { ...offer, votes: offer.votes - change } : offer,
          ),
        );
      },
    });
  }

  /**
   * Persists user votes to localStorage.
   * @private
   */
  private saveUserVotes(): void {
    localStorage.setItem('rebuy_user_votes', JSON.stringify(this.userVotesSignal()));
  }

  /**
   * Loads persisted user votes from localStorage on store initialization.
   * Returns empty array if no votes found or JSON is invalid.
   * @private
   */
  private loadUserVotes(): UserVote[] {
    const stored = localStorage.getItem('rebuy_user_votes');
    return stored ? JSON.parse(stored) : [];
  }
}
