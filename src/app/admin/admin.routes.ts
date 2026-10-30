import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'application',
    loadChildren: () =>
      import('./application/application.routes').then(
        (m) => m.APPLICATION_ROUTES
      ),
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    path: '',
    redirectTo: 'application',
    pathMatch: 'full',
  },
];
