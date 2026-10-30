import { Routes } from '@angular/router';

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
        path: '',
        redirectTo: 'company-onboarding',
        pathMatch: 'full',
      },
    ],
  },
];
