import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
  { path: 'verify-email/:token', loadComponent: () => import('./verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password/:token', loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'accept-invite/:token', loadComponent: () => import('./accept-invite/accept-invite.component').then(m => m.AcceptInviteComponent) },
  { path: 'callback', loadComponent: () => import('./callback/callback.component').then(m => m.CallbackComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
