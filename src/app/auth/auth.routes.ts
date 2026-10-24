import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./auth-layout/auth-layout.component').then(c => c.AuthLayoutComponent),
        children: []
    }
];