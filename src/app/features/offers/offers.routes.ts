import { Routes } from '@angular/router';

export const OFFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/offer-list-page/offer-list-page.component').then(
        (m) => m.OfferListPageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/offer-details-page/offer-details-page.component').then(
        (m) => m.OfferDetailsPageComponent,
      ),
  },
];
