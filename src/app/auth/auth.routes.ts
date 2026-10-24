import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-layout/auth-layout.component').then((c) => c.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent) },
    ],
  },
];
