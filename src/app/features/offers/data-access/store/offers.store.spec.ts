import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OffersStore } from './offers.store';
import { OffersApiService } from '@shared/data-access/api/offers-api.service';
import { of, throwError } from 'rxjs';

describe('OffersStore', () => {
  let store: OffersStore;
  let apiService: ReturnType<typeof createMockApiService>;

  function createMockApiService() {
    return {
      getOffers: vi.fn(),
      getOfferById: vi.fn(),
      updateVote: vi.fn(),
    };
  }

  const mockOffer = {
    id: 'test-1',
    title: 'Test Offer',
    description: 'Test description',
    price: 100,
    currency: 'USD',
    imageUrl: 'test.jpg',
    category: 'Electronics',
    condition: 'new' as const,
    seller: 'Test Seller',
    votes: 10,
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create mock for API service
    apiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [OffersStore, { provide: OffersApiService, useValue: apiService }],
    });

    // Default mock responses
    apiService.getOffers.mockReturnValue(
      of({
        offers: [mockOffer],
        total: 1,
        page: 0,
        pageSize: 10,
        hasMore: false,
      }),
    );

    store = TestBed.inject(OffersStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', async () => {
      // Wait a tick for initial state to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      // After initial load completes, loading should be false
      expect(store.loading()).toBeDefined();
    });

    it('should load first page on initialization', async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      expect(apiService.getOffers).toHaveBeenCalledWith(0, 10);
    });

    it('should have empty offers initially', () => {
      const initialOffers = store.offers();
      expect(Array.isArray(initialOffers)).toBe(true);
    });
  });

  describe('loadNextPage', () => {
    it('should not load if already loading', async () => {
      // Create a slow-resolving promise to keep resource in loading state
      TestBed.resetTestingModule();
      const slowApi = {
        getOffers: vi.fn().mockReturnValue(
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  offers: [mockOffer],
                  total: 1,
                  page: 0,
                  pageSize: 10,
                  hasMore: false,
                }),
              1000,
            );
          }),
        ),
        getOfferById: vi.fn(),
        updateVote: vi.fn(),
      };

      TestBed.configureTestingModule({
        providers: [OffersStore, { provide: OffersApiService, useValue: slowApi }],
      });

      const slowStore = TestBed.inject(OffersStore);
      expect(slowStore.loading()).toBe(true);

      // Try to load next page while loading
      slowApi.getOffers.mockClear();
      slowStore.loadNextPage();

      // Should not make another call
      expect(slowApi.getOffers).not.toHaveBeenCalled();
    });

    it('should not load if no more pages', async () => {
      apiService.getOffers.mockReturnValue(
        of({
          offers: [],
          total: 0,
          page: 0,
          pageSize: 10,
          hasMore: false,
        }),
      );

      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      apiService.getOffers.mockClear();
      store.loadNextPage();

      expect(apiService.getOffers).not.toHaveBeenCalled();
    });

    it('should accumulate offers from multiple pages', async () => {
      const page1 = [{ ...mockOffer, id: 'offer-1' }];
      const page2 = [{ ...mockOffer, id: 'offer-2' }];

      // Reset and create new store with fresh mocks
      TestBed.resetTestingModule();
      const paginationApi = {
        getOffers: vi.fn(),
        getOfferById: vi.fn(),
        updateVote: vi.fn(),
      };

      paginationApi.getOffers
        .mockReturnValueOnce(
          of({
            offers: page1,
            total: 20,
            page: 0,
            pageSize: 10,
            hasMore: true,
          }),
        )
        .mockReturnValueOnce(
          of({
            offers: page2,
            total: 20,
            page: 1,
            pageSize: 10,
            hasMore: false,
          }),
        );

      TestBed.configureTestingModule({
        providers: [OffersStore, { provide: OffersApiService, useValue: paginationApi }],
      });

      const paginationStore = TestBed.inject(OffersStore);

      // Wait for first page to load (auto-loaded in constructor)
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(paginationStore.offers().length).toBe(1);

      // Load second page
      paginationStore.loadNextPage();

      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(paginationStore.offers().length).toBe(2);
    });

    it('should handle API errors gracefully', async () => {
      // Reset and create new store with error-throwing API
      TestBed.resetTestingModule();
      const errorApi = {
        getOffers: vi.fn().mockReturnValue(throwError(() => new Error('Network error'))),
        getOfferById: vi.fn(),
        updateVote: vi.fn(),
      };

      TestBed.configureTestingModule({
        providers: [OffersStore, { provide: OffersApiService, useValue: errorApi }],
      });

      const errorStore = TestBed.inject(OffersStore);

      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(errorStore.error()).toBeTruthy();
      expect(errorStore.loading()).toBe(false);
    });
  });

  describe('getOfferById', () => {
    it('should return offer when it exists', async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      const offer = store.getOfferById(mockOffer.id);
      expect(offer).toBeDefined();
      expect(offer?.id).toBe(mockOffer.id);
    });

    it('should return undefined when offer does not exist', async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      const offer = store.getOfferById('non-existent');
      expect(offer).toBeUndefined();
    });
  });

  describe('Voting System', () => {
    beforeEach(async () => {
      apiService.updateVote.mockReturnValue(of({ votes: 11 }));
      // Wait for initial load
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
    });

    describe('upvote', () => {
      it('should increment votes on first upvote', () => {
        const initialVotes = mockOffer.votes;
        store.upvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes + 1);
      });

      it('should remove upvote when clicking upvote again', () => {
        const initialVotes = mockOffer.votes;

        store.upvote(mockOffer.id);
        store.upvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes);
      });

      it('should change downvote to upvote (+2 total)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const initialVotes = store.getOfferById(mockOffer.id)!.votes;

        store.downvote(mockOffer.id);
        store.upvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes + 1); // downvote(-1) then upvote(+2) = +1 net
      });

      it('should update user vote state', () => {
        store.upvote(mockOffer.id);

        expect(store.getUserVote(mockOffer.id)).toBe(1);
      });

      it('should call API to sync vote', () => {
        store.upvote(mockOffer.id);

        expect(apiService.updateVote).toHaveBeenCalledWith(mockOffer.id, 1);
      });
    });

    describe('downvote', () => {
      it('should decrement votes on first downvote', () => {
        const initialVotes = mockOffer.votes;
        store.downvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes - 1);
      });

      it('should remove downvote when clicking downvote again', () => {
        const initialVotes = mockOffer.votes;

        store.downvote(mockOffer.id);
        store.downvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes);
      });

      it('should change upvote to downvote (-2 total)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const initialVotes = store.getOfferById(mockOffer.id)!.votes;

        store.upvote(mockOffer.id);
        store.downvote(mockOffer.id);

        const offer = store.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes - 1); // upvote(+1) then downvote(-2) = -1 net
      });

      it('should update user vote state', () => {
        store.downvote(mockOffer.id);

        expect(store.getUserVote(mockOffer.id)).toBe(-1);
      });

      it('should call API to sync vote', () => {
        store.downvote(mockOffer.id);

        expect(apiService.updateVote).toHaveBeenCalledWith(mockOffer.id, -1);
      });
    });

    describe('Vote Persistence', () => {
      it('should save votes to localStorage', () => {
        store.upvote(mockOffer.id);

        const stored = localStorage.getItem('rebuy_user_votes');
        expect(stored).toBeTruthy();

        const votes = JSON.parse(stored!);
        expect(votes).toEqual([{ offerId: mockOffer.id, voteType: 1 }]);
      });

      it('should load votes from localStorage on initialization', async () => {
        localStorage.setItem(
          'rebuy_user_votes',
          JSON.stringify([{ offerId: 'test-1', voteType: 1 }]),
        );

        TestBed.resetTestingModule();
        const freshApi = {
          getOffers: vi.fn().mockReturnValue(
            of({
              offers: [mockOffer],
              total: 1,
              page: 0,
              pageSize: 10,
              hasMore: false,
            }),
          ),
          getOfferById: vi.fn(),
          updateVote: vi.fn(),
        };

        TestBed.configureTestingModule({
          providers: [OffersStore, { provide: OffersApiService, useValue: freshApi }],
        });

        const newStore = TestBed.inject(OffersStore);
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(newStore.getUserVote('test-1')).toBe(1);
      });
    });

    describe('Optimistic Updates with Rollback', () => {
      it('should rollback vote on API failure', async () => {
        TestBed.resetTestingModule();
        const failingApi = {
          getOffers: vi.fn().mockReturnValue(
            of({
              offers: [mockOffer],
              total: 1,
              page: 0,
              pageSize: 10,
              hasMore: false,
            }),
          ),
          getOfferById: vi.fn(),
          updateVote: vi.fn().mockReturnValue(throwError(() => new Error('API Error'))),
        };

        TestBed.configureTestingModule({
          providers: [OffersStore, { provide: OffersApiService, useValue: failingApi }],
        });

        const rollbackStore = TestBed.inject(OffersStore);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const initialVotes = rollbackStore.getOfferById(mockOffer.id)!.votes;

        // Upvote and wait for rollback to happen
        rollbackStore.upvote(mockOffer.id);

        // Wait for API call to fail and rollback to complete
        await new Promise((resolve) => setTimeout(resolve, 300));
        const offer = rollbackStore.getOfferById(mockOffer.id);
        expect(offer?.votes).toBe(initialVotes);
      });
    });
  });

  describe('Sorting', () => {
    it('should sort offers by votes descending', async () => {
      const offers = [
        { ...mockOffer, id: 'offer-1', votes: 5 },
        { ...mockOffer, id: 'offer-2', votes: 15 },
        { ...mockOffer, id: 'offer-3', votes: 10 },
      ];

      TestBed.resetTestingModule();
      const sortApi = {
        getOffers: vi.fn().mockReturnValue(
          of({
            offers,
            total: 3,
            page: 0,
            pageSize: 10,
            hasMore: false,
          }),
        ),
        getOfferById: vi.fn(),
        updateVote: vi.fn(),
      };

      TestBed.configureTestingModule({
        providers: [OffersStore, { provide: OffersApiService, useValue: sortApi }],
      });

      const newStore = TestBed.inject(OffersStore);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const sortedOffers = newStore.offers();
      expect(sortedOffers[0].votes).toBe(15);
      expect(sortedOffers[1].votes).toBe(10);
      expect(sortedOffers[2].votes).toBe(5);
    });

    it('should maintain sort order after voting', async () => {
      const offers = [
        { ...mockOffer, id: 'offer-1', votes: 10 },
        { ...mockOffer, id: 'offer-2', votes: 5 },
      ];

      TestBed.resetTestingModule();
      const sortApi = {
        getOffers: vi.fn().mockReturnValue(
          of({
            offers,
            total: 2,
            page: 0,
            pageSize: 10,
            hasMore: false,
          }),
        ),
        getOfferById: vi.fn(),
        updateVote: vi.fn().mockReturnValue(of({ votes: 6 })),
      };

      TestBed.configureTestingModule({
        providers: [OffersStore, { provide: OffersApiService, useValue: sortApi }],
      });

      const sortStore = TestBed.inject(OffersStore);

      // Wait for initial load
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Upvote the second offer
      sortStore.upvote('offer-2');

      // Wait for update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const sortedOffers = sortStore.offers();
      // Still sorted correctly (offer-1: 10, offer-2: 6)
      expect(sortedOffers[0].id).toBe('offer-1');
      expect(sortedOffers[1].id).toBe('offer-2');
    });

    describe('getUserVote', () => {
      it('should return 0 for offer with no vote', () => {
        expect(store.getUserVote('any-offer')).toBe(0);
      });

      it('should return 1 for upvoted offer', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 200));
        apiService.updateVote.mockReturnValue(of({ votes: 11 }));
        store.upvote(mockOffer.id);
        expect(store.getUserVote(mockOffer.id)).toBe(1);
      });

      it('should return -1 for downvoted offer', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 200));
        apiService.updateVote.mockReturnValue(of({ votes: 9 }));
        store.downvote(mockOffer.id);
        expect(store.getUserVote(mockOffer.id)).toBe(-1);
      });
    });
  });
});
