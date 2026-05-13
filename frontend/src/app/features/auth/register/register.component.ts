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
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-content>
          <div class="auth-header">
            <div class="logo">✅</div>
            <h1>Create Account</h1>
            <p>Join Project Todo today</p>
          </div>

          @if (success) {
            <div class="success-msg">
              <mat-icon>check_circle</mat-icon>
              Registration successful! Check your email to verify your account.
            </div>
          } @else {
            <form (ngSubmit)="onRegister()" #f="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput [(ngModel)]="name" name="name" required />
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="email" name="email" required />
                <mat-icon matPrefix>mail</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" name="password" required minlength="6" />
                <mat-icon matPrefix>lock</mat-icon>
                <button type="button" mat-icon-button matSuffix (click)="showPass = !showPass">
                  <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              @if (error) { <div class="error-msg">{{ error }}</div> }

              <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading">
                @if (loading) { <mat-spinner diameter="20" /> } @else { Create Account }
              </button>
            </form>
          }

          <p class="login-link">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
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
    .error-msg { background: #ffebee; color: #c62828; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 10px; }
    .success-msg { background: #e8f5e9; color: #2e7d32; padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px; }
    .login-link { text-align: center; margin-top: 20px; font-size: 14px; }
    .login-link a { color: var(--mat-sys-primary); text-decoration: none; }
    mat-spinner { margin: auto; }
  `]
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; showPass = false; loading = false; error = ''; success = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.loading = true; this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: err => { this.error = err.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
