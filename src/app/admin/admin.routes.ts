import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'application',
    loadChildren: () => import('./application/application.routes').then(m => m.APPLICATION_ROUTES)
  }
];