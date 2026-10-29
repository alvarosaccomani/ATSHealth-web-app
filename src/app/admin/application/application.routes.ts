import { Routes } from '@angular/router';

export const APPLICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./application-layout/application-layout.component').then(
        (c) => c.ApplicationLayoutComponent
      ),
    children: [
      {
        path: 'patients',
        loadComponent: () =>
          import('./patients-list/patients-list.component').then(
            (c) => c.PatientsListComponent
          ),
      },
      {
        path: 'patient',
        loadComponent: () =>
          import('./patient/patient.component').then((c) => c.PatientComponent),
      },
      {
        path: 'patient/:pat_uuid',
        loadComponent: () =>
          import('./patient/patient.component').then((c) => c.PatientComponent),
      },
      {
        path: 'encounter',
        loadComponent: () =>
          import('./encounter/encounter.component').then(
            (c) => c.EncounterComponent
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
