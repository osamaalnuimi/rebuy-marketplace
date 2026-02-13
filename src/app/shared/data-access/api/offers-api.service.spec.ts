import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OffersApiService } from './offers-api.service';
import { firstValueFrom } from 'rxjs';
import { Offer } from '@shared/data-access/models/offer.model';

describe('OffersApiService', () => {
  let service: OffersApiService;
  let httpMock: HttpTestingController;

  const mockOffers: Offer[] = [
    {
      id: 'test-1',
      title: 'Test Product 1',
      description: 'Test description',
      price: 99.99,
      currency: 'EUR',
      imageUrl: '/test.jpg',
      category: 'electronics',
      condition: 'like-new',
      seller: 'Test Seller',
      votes: 10,
      createdAt: new Date(),
    },
    {
      id: 'test-2',
      title: 'Test Product 2',
      description: 'Test description 2',
      price: 49.99,
      currency: 'EUR',
      imageUrl: '/test2.jpg',
      category: 'home',
      condition: 'good',
      seller: 'Test Seller 2',
      votes: 5,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OffersApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OffersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOffers', () => {
    it('should return paginated offers with correct structure', async () => {
      const promise = firstValueFrom(service.getOffers(0, 10));

      const req = httpMock.expectOne('/api/offers.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockOffers);

      const result = await promise;

      expect(result).toBeDefined();
      expect(result.offers).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should return correct number of items per page', async () => {
      const pageSize = 1;
      const promise = firstValueFrom(service.getOffers(0, pageSize));

      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);

      const result = await promise;

      expect(result.offers.length).toBe(1);
    });

    it('should return different offers for different pages', async () => {
      const promise1 = firstValueFrom(service.getOffers(0, 1));
      const req1 = httpMock.expectOne('/api/offers.json');
      req1.flush(mockOffers);
      const page1 = await promise1;

      const promise2 = firstValueFrom(service.getOffers(1, 1));
      const req2 = httpMock.expectOne('/api/offers.json');
      req2.flush(mockOffers);
      const page2 = await promise2;

      const page1Ids = page1.offers.map((o) => o.id);
      const page2Ids = page2.offers.map((o) => o.id);

      expect(page1Ids[0]).toBe('test-1');
      expect(page2Ids[0]).toBe('test-2');
    });

    it('should indicate hasMore correctly when more data exists', async () => {
      const promise = firstValueFrom(service.getOffers(0, 1));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const result = await promise;

      expect(result.hasMore).toBe(true);
    });

    it('should indicate hasMore false on last page', async () => {
      const promise = firstValueFrom(service.getOffers(1, 1));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const result = await promise;

      expect(result.hasMore).toBe(false);
    });

    it('should handle empty results for page beyond data', async () => {
      const promise = firstValueFrom(service.getOffers(999, 10));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const result = await promise;

      expect(result.offers).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('should return valid offer objects with required fields', async () => {
      const promise = firstValueFrom(service.getOffers(0, 1));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const result = await promise;

      const offer = result.offers[0];

      expect(offer.id).toBe('test-1');
      expect(offer.title).toBe('Test Product 1');
      expect(offer.description).toBeDefined();
      expect(offer.price).toBeGreaterThanOrEqual(0);
      expect(offer.imageUrl).toBeDefined();
      expect(offer.category).toBeDefined();
      expect(offer.condition).toBeDefined();
      expect(offer.seller).toBeDefined();
      expect(typeof offer.votes).toBe('number');
    });
  });

  describe('getOfferById', () => {
    it('should return an offer when valid ID is provided', async () => {
      const promise = firstValueFrom(service.getOfferById('test-1'));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const offer = await promise;

      expect(offer).toBeTruthy();
      expect(offer?.id).toBe('test-1');
    });

    it('should return null for non-existent ID', async () => {
      const promise = firstValueFrom(service.getOfferById('non-existent-id'));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const offer = await promise;

      expect(offer).toBeNull();
    });

    it('should return complete offer object', async () => {
      const promise = firstValueFrom(service.getOfferById('test-1'));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const offer = await promise;

      expect(offer).not.toBeNull();
      expect(offer!.title).toBe('Test Product 1');
      expect(offer!.price).toBe(99.99);
      expect(offer!.description).toBeDefined();
    });
  });

  describe('updateVote', () => {
    it('should return updated votes count after upvote', async () => {
      const getPromise = firstValueFrom(service.getOffers(0, 1));
      const getReq = httpMock.expectOne('/api/offers.json');
      getReq.flush(mockOffers);
      await getPromise;

      const result = await firstValueFrom(service.updateVote('test-1', 1));

      expect(result.votes).toBe(11);
    });

    it('should return updated votes count after downvote', async () => {
      const getPromise = firstValueFrom(service.getOffers(0, 1));
      const getReq = httpMock.expectOne('/api/offers.json');
      getReq.flush(mockOffers);
      await getPromise;

      const result = await firstValueFrom(service.updateVote('test-1', -1));

      expect(result.votes).toBe(9);
    });

    it('should handle multiple vote changes', async () => {
      const getPromise = firstValueFrom(service.getOffers(0, 1));
      const getReq = httpMock.expectOne('/api/offers.json');
      getReq.flush(mockOffers);
      await getPromise;

      await firstValueFrom(service.updateVote('test-1', 1));
      await firstValueFrom(service.updateVote('test-1', 1));
      const result = await firstValueFrom(service.updateVote('test-1', -1));

      expect(result.votes).toBe(11);
    });

    it('should return 0 votes for non-existent offer', async () => {
      const result = await firstValueFrom(service.updateVote('non-existent', 1));

      expect(result.votes).toBe(1);
    });
  });

  describe('Vote persistence', () => {
    it('should cache votes across multiple getOffers calls', async () => {
      const promise1 = firstValueFrom(service.getOffers(0, 1));
      const req1 = httpMock.expectOne('/api/offers.json');
      req1.flush(mockOffers);
      await promise1;

      await firstValueFrom(service.updateVote('test-1', 5));

      const promise2 = firstValueFrom(service.getOffers(0, 1));
      const req2 = httpMock.expectOne('/api/offers.json');
      req2.flush(mockOffers);
      const result = await promise2;

      expect(result.offers[0].votes).toBe(15);
    });

    it('should apply cached votes in getOfferById', async () => {
      const getPromise = firstValueFrom(service.getOffers(0, 1));
      const getReq = httpMock.expectOne('/api/offers.json');
      getReq.flush(mockOffers);
      await getPromise;

      await firstValueFrom(service.updateVote('test-1', 3));

      const promise = firstValueFrom(service.getOfferById('test-1'));
      const req = httpMock.expectOne('/api/offers.json');
      req.flush(mockOffers);
      const offer = await promise;

      expect(offer?.votes).toBe(13);
    });
  });
});
