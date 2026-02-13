import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OfferListPageComponent } from './offer-list-page.component';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('OfferListPageComponent', () => {
  let component: OfferListPageComponent;
  let fixture: ComponentFixture<OfferListPageComponent>;
  let mockStore: ReturnType<typeof _createMockStore>;

  function _createMockStore() {
    return {
      loadNextPage: vi.fn(),
      upvote: vi.fn(),
      downvote: vi.fn(),
      getUserVote: vi.fn(),
      offers: signal(mockOffers),
      loading: signal(false),
      hasMore: signal(true),
      error: signal<string | null>(null),
      loadMore: vi.fn(),
    };
  }

  const mockOffers = [
    {
      id: 'offer-1',
      title: 'Test Offer 1',
      description: 'Description 1',
      price: 100,
      currency: 'USD',
      imageUrl: 'test1.jpg',
      category: 'Electronics',
      condition: 'new' as const,
      seller: 'Seller 1',
      votes: 10,
      createdAt: new Date(),
    },
    {
      id: 'offer-2',
      title: 'Test Offer 2',
      description: 'Description 2',
      price: 200,
      currency: 'USD',
      imageUrl: 'test2.jpg',
      category: 'Fashion',
      condition: 'like-new' as const,
      seller: 'Seller 2',
      votes: 5,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockStore = _createMockStore();

    await TestBed.configureTestingModule({
      imports: [OfferListPageComponent],
      providers: [{ provide: OffersStore, useValue: mockStore }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Logic', () => {
    it('should initialize with store signals', () => {
      expect(component.offers()).toEqual(mockOffers);
      expect(component.loading()).toBe(false);
      expect(component.hasMore()).toBe(true);
      expect(component.error()).toBeNull();
    });

    it('should call store upvote', () => {
      component.onUpvote('offer-1');
      expect(mockStore.upvote).toHaveBeenCalledWith('offer-1');
    });

    it('should call store downvote', () => {
      component.onDownvote('offer-2');
      expect(mockStore.downvote).toHaveBeenCalledWith('offer-2');
    });

    it('should get user vote from store', () => {
      mockStore.getUserVote.mockReturnValue(1);
      const vote = component.getUserVote('offer-1');
      expect(vote).toBe(1);
    });

    it('should call loadNextPage', () => {
      component.loadMore();
      expect(mockStore.loadNextPage).toHaveBeenCalled();
    });
  });

  describe('Infinite Scroll', () => {
    it('should call loadMore when scrolled near bottom', () => {
      vi.stubGlobal('scrollY', 1000);
      vi.stubGlobal('innerHeight', 800);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 2000,
      });

      component.onWindowScroll();

      expect(mockStore.loadNextPage).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('should not call loadMore when far from bottom', () => {
      vi.stubGlobal('scrollY', 100);
      vi.stubGlobal('innerHeight', 800);
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 3000,
      });

      component.onWindowScroll();

      expect(mockStore.loadNextPage).not.toHaveBeenCalled();
      vi.unstubAllGlobals();
    });
  });
});
