import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';
import { Offer } from '@shared/data-access/models/offer.model';

export interface OffersPageResponse {
  offers: Offer[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Service for managing offer data through HTTP requests.
 * Fetches data from static JSON file and simulates API interactions.
 *
 * @remarks
 * This service makes real HTTP GET requests visible in the browser's network tab.
 * Vote updates are cached in-memory since static JSON cannot be modified.
 */
@Injectable({
  providedIn: 'root',
})
export class OffersApiService {
  readonly #http = inject(HttpClient);
  readonly #apiUrl = '/api/offers.json';
  #allOffers: Offer[] | null = null;
  #votesCache = new Map<string, number>();

  /**
   * Fetches paginated offers from the API.
   *
   * @param page - Zero-based page number (default: 0)
   * @param pageSize - Number of items per page (default: 10)
   * @returns Observable of paginated offers response with metadata

   */
  getOffers(page = 0, pageSize = 10): Observable<OffersPageResponse> {
    return this.#http.get<Offer[]>(this.#apiUrl).pipe(
      map((allOffers) => {
        this.#allOffers = allOffers;

        const offersWithVotes = allOffers.map((offer) => ({
          ...offer,
          votes: this.#votesCache.get(offer.id) ?? offer.votes,
        }));

        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedOffers = offersWithVotes.slice(start, end);

        return {
          offers: paginatedOffers,
          total: allOffers.length,
          page,
          pageSize,
          hasMore: end < allOffers.length,
        };
      }),
    );
  }

  /**
   * Fetches a single offer by its unique identifier.
   *
   * @param id - Unique offer identifier
   * @returns Observable of the offer or null if not found

   */
  getOfferById(id: string): Observable<Offer | null> {
    return this.#http.get<Offer[]>(this.#apiUrl).pipe(
      map((allOffers) => {
        const offer = allOffers.find((o) => o.id === id);
        if (offer && this.#votesCache.has(id)) {
          return { ...offer, votes: this.#votesCache.get(id)! };
        }
        return offer || null;
      }),
    );
  }

  /**
   * Updates the vote count for an offer.
   *
   * @param offerId - Unique offer identifier
   * @param voteChange - Vote increment (+1) or decrement (-1)
   * @returns Observable of the updated vote count
   *
   * @remarks
   * This simulates a POST request with network delay. In a production app,
   * this would be: `this.http.post<{votes: number}>(`/api/offers/${offerId}/vote`, {voteChange})`
   *
   * Since we use static JSON, votes are cached in-memory and persist only during the session.
   */
  updateVote(offerId: string, voteChange: number): Observable<{ votes: number }> {
    const currentVotes =
      this.#votesCache.get(offerId) ?? this.#allOffers?.find((o) => o.id === offerId)?.votes ?? 0;
    const newVotes = currentVotes + voteChange;
    this.#votesCache.set(offerId, newVotes);

    return of({ votes: newVotes }).pipe(delay(150));
  }
}
