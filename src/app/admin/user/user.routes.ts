import { Routes } from '@angular/router';
import { adminRoleGuard } from '@guards/admin-role.guard';
import { hasCompanyGuard } from '@guards/has-company.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-layout/user-layout.component').then(
        (c) => c.UserLayoutComponent
      ),
    children: [
      {
        path: 'patients',
        canActivate: [hasCompanyGuard],
        loadComponent: () =>
          import('./patients-list/patients-list.component').then(
            (c) => c.PatientsListComponent
          ),
      },
      {
        path: 'patient',
        canActivate: [hasCompanyGuard],
        loadComponent: () =>
          import('./patient/patient.component').then((c) => c.PatientComponent),
      },
      {
        path: 'patient/:pat_uuid',
        canActivate: [hasCompanyGuard],
        loadComponent: () =>
          import('./patient/patient.component').then((c) => c.PatientComponent),
      },
      {
        path: 'encounter',
        canActivate: [hasCompanyGuard],
        loadComponent: () =>
          import('./encounter/encounter.component').then(
            (c) => c.EncounterComponent
          ),
      },
      {
        path: 'encounter/:pat_uuid',
        canActivate: [hasCompanyGuard],
        loadComponent: () =>
          import('./encounter/encounter.component').then(
            (c) => c.EncounterComponent
          ),
      },
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
        path: 'company-items',
        canActivate: [adminRoleGuard, hasCompanyGuard],
        loadComponent: () =>
          import('./company-items/company-items.component').then(
            (c) => c.CompanyItemsComponent
          ),
      },
      {
        path: 'company-profile',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./company-profile/company-profile.component').then(
            (c) => c.CompanyProfileComponent
          ),
      },
      {
        path: '',
        redirectTo: 'patients',
        pathMatch: 'full',
      },
    ],
  },
];
