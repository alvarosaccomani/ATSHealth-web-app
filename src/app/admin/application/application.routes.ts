import { Routes } from '@angular/router';

export const APPLICATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./application-layout/application-layout.component').then(c => c.ApplicationLayoutComponent),
        children: []
    }
];