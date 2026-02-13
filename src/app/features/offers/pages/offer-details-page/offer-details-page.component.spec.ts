import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferDetailsPageComponent } from './offer-details-page.component';
import { OffersStore } from '@features/offers/data-access/store/offers.store';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { Component } from '@angular/core';

// Dummy component for routing
@Component({ selector: 'dummy', template: '', standalone: true })
class DummyComponent {}

describe('OfferDetailsPageComponent', () => {
  let component: OfferDetailsPageComponent;
  let fixture: ComponentFixture<OfferDetailsPageComponent>;
  let mockStore: ReturnType<typeof _createMockStore>;
  let router: Router;

  function _createMockStore() {
    return {
      getOfferById: vi.fn((id: string) => (id === 'test-offer-1' ? mockOffer : undefined)),
      getUserVote: vi.fn(() => 0),
      upvote: vi.fn(),
      downvote: vi.fn(),
    };
  }

  const mockOffer = {
    id: 'test-offer-1',
    title: 'Test Laptop',
    description: 'A great laptop in excellent condition',
    price: 500,
    currency: 'USD',
    imageUrl: 'laptop.jpg',
    category: 'Electronics',
    condition: 'like-new' as const,
    seller: 'TechSeller',
    votes: 42,
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(async () => {
    mockStore = _createMockStore();

    await TestBed.configureTestingModule({
      imports: [OfferDetailsPageComponent],
      providers: [
        { provide: OffersStore, useValue: mockStore },
        provideRouter(
          [
            { path: '', component: DummyComponent },
            { path: 'offer/:id', component: OfferDetailsPageComponent },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OfferDetailsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.componentRef.setInput('id', 'test-offer-1');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Logic', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('id', 'test-offer-1');
      fixture.detectChanges();
    });

    it('should compute offer from store', () => {
      expect(component.offer()).toEqual(mockOffer);
      expect(mockStore.getOfferById).toHaveBeenCalledWith('test-offer-1');
    });

    it('should initialize with closed purchase modal', () => {
      expect(component.showPurchaseModal()).toBe(false);
    });

    it('should call store upvote for valid offer', () => {
      component.onUpvote();
      expect(mockStore.upvote).toHaveBeenCalledWith(mockOffer.id);
    });

    it('should call store downvote for valid offer', () => {
      component.onDownvote();
      expect(mockStore.downvote).toHaveBeenCalledWith(mockOffer.id);
    });

    it('should not call upvote when offer is undefined', () => {
      mockStore.getOfferById.mockReturnValue(undefined);
      fixture.componentRef.setInput('id', 'non-existent');
      fixture.detectChanges();

      component.onUpvote();
      expect(mockStore.upvote).not.toHaveBeenCalled();
    });
  });

  describe('Purchase Modal', () => {
    it('should open purchase modal', () => {
      component.openPurchaseModal();
      expect(component.showPurchaseModal()).toBe(true);
    });

    it('should close purchase modal', () => {
      component.showPurchaseModal.set(true);
      component.closePurchaseModal();
      expect(component.showPurchaseModal()).toBe(false);
    });

    it('should set purchase success', () => {
      component.confirmPurchase();
      expect(component.purchaseSuccess()).toBe(true);
    });

    it('should navigate after purchase', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      vi.useFakeTimers();
      component.confirmPurchase();
      vi.advanceTimersByTime(2100);
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
      vi.useRealTimers();
    });
  });

  describe('Navigation', () => {
    it('should navigate to home on goBack', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Route Parameter Changes', () => {
    it('should update offer when route ID changes', () => {
      fixture.componentRef.setInput('id', 'test-offer-1');
      fixture.detectChanges();
      expect(mockStore.getOfferById).toHaveBeenCalledWith('test-offer-1');

      const secondOffer = { ...mockOffer, id: 'test-offer-2' };
      mockStore.getOfferById.mockImplementation((id: string) =>
        id === 'test-offer-2' ? secondOffer : undefined,
      );

      fixture.componentRef.setInput('id', 'test-offer-2');
      fixture.detectChanges();

      expect(mockStore.getOfferById).toHaveBeenCalledWith('test-offer-2');
      expect(component.offer()).toEqual(secondOffer);
    });
  });
});
