import { Routes } from '@angular/router';
import { adminRoleGuard } from '@guards/admin-role.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-layout/user-layout.component').then(
        (c) => c.UserLayoutComponent
      ),
    children: [
      {
        path: 'company-onboarding',
        loadComponent: () =>
          import('./company-onboarding/company-onboarding.component').then(
            (c) => c.CompanyOnboardingComponent
          ),
      },
      {
        path: 'company-users',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./company-users/company-users.component').then(
            (c) => c.CompanyUsersComponent
          ),
      },
      {
        path: '',
        redirectTo: 'company-onboarding',
        pathMatch: 'full',
      },
    ],
  },
];
