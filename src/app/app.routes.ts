import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/offers/offers.routes').then((m) => m.OFFERS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
