import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-content>
          <div class="auth-header">
            <div class="logo">✅</div>
            <h1>Project Todo</h1>
            <p>Sign in to your account</p>
          </div>

          <form (ngSubmit)="onLogin()" #f="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required />
              <mat-icon matPrefix>mail</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" name="password" required />
              <mat-icon matPrefix>lock</mat-icon>
              <button type="button" mat-icon-button matSuffix (click)="showPass = !showPass">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="forgot-link">
              <a routerLink="/auth/forgot-password">Forgot password?</a>
            </div>

            @if (error) {
              <div class="error-msg">{{ error }}</div>
            }

            <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
              @if (loading) { <mat-spinner diameter="20" /> } @else { Sign In }
            </button>
          </form>

          <mat-divider class="divider" />

          <button mat-stroked-button class="full-width google-btn" (click)="loginWithGoogle()">
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
            Continue with Google
          </button>

          <button mat-stroked-button class="full-width guest-btn" (click)="guestLogin()">
            <mat-icon>person_outline</mat-icon> Continue as Guest
          </button>

          <p class="register-link">Don't have an account? <a routerLink="/auth/register">Register</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--mat-sys-surface-variant); padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; padding: 8px; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 48px; margin-bottom: 8px; }
    h1 { margin: 0 0 4px; font-size: 24px; font-weight: 600; }
    p { margin: 0; color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .full-width { width: 100%; }
    .submit-btn { height: 44px; margin-top: 8px; }
    .google-btn, .guest-btn { height: 44px; margin-top: 10px; gap: 8px; }
    .google-btn img { margin-right: 6px; }
    .divider { margin: 20px 0; }
    .forgot-link { text-align: right; margin-bottom: 8px; font-size: 13px; }
    .forgot-link a, .register-link a { color: var(--mat-sys-primary); text-decoration: none; }
    .error-msg { background: #ffebee; color: #c62828; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 10px; }
    .register-link { text-align: center; margin-top: 20px; font-size: 14px; }
    mat-spinner { margin: auto; }
  `]
})
export class LoginComponent {
  email = ''; password = ''; showPass = false; loading = false; error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.error = err.error?.message || 'Login failed'; this.loading = false; }
    });
  }

  loginWithGoogle() { this.auth.loginWithGoogle(); }

  guestLogin() {
    this.loading = true;
    this.auth.guestLogin().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.error = err.error?.message || 'Guest login failed'; this.loading = false; }
    });
  }
}
