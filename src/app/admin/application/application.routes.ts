import { Routes } from '@angular/router';
import { adminRoleGuard } from '@guards/admin-role.guard';

export const APPLICATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminRoleGuard],
    loadComponent: () =>
      import('./application-layout/application-layout.component').then(
        (c) => c.ApplicationLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'templates',
        pathMatch: 'full',
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./templates/templates.component').then(
            (c) => c.TemplatesComponent
          ),
      },
    ],
  },
];
