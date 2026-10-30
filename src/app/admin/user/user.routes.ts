import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-layout/user-layout.component').then(
        (c) => c.UserLayoutComponent
      ),
    children: [],
  },
];
