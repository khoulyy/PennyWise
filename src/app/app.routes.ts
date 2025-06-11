import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { AllTransactionsComponent } from './pages/all-transactions/all-transactions.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Login',
    component: LoginComponent,
    canActivate: [authGuard], // <--- Add guard here
  },
  {
    path: 'home',
    title: 'Home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    title: 'Profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  { path: 'register', component: RegisterComponent },
  {
    path: 'all-transactions',
    loadComponent: () =>
      import('./pages/all-transactions/all-transactions.component').then(
        (m) => m.AllTransactionsComponent
      ),
  },
  {
    path: '**',
    title: 'Not Found',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
