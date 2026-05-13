import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-content>
          <div class="auth-header">
            <mat-icon class="big-icon">lock_reset</mat-icon>
            <h1>Reset Password</h1>
            <p>Enter your email and we'll send a reset link</p>
          </div>
          @if (sent) {
            <div class="success-msg"><mat-icon>check_circle</mat-icon> Reset link sent! Check your inbox.</div>
          } @else {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" />
              <mat-icon matPrefix>mail</mat-icon>
            </mat-form-field>
            @if (error) { <div class="error-msg">{{ error }}</div> }
            <button mat-raised-button color="primary" class="full-width" (click)="submit()">Send Reset Link</button>
          }
          <p class="back-link"><a routerLink="/auth/login">← Back to Login</a></p>
        </mat-card-content>
      </mat-card>
    </div>`,
  styles: [`.auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--mat-sys-surface-variant);padding:16px}.auth-card{width:100%;max-width:420px;padding:8px}.auth-header{text-align:center;margin-bottom:24px}.big-icon{font-size:48px;width:48px;height:48px;color:var(--mat-sys-primary)}.full-width{width:100%}.success-msg{background:#e8f5e9;color:#2e7d32;padding:16px;border-radius:8px;display:flex;align-items:center;gap:8px}.error-msg{background:#ffebee;color:#c62828;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:10px}.back-link{text-align:center;margin-top:16px}.back-link a{color:var(--mat-sys-primary);text-decoration:none}`]
})
export class ForgotPasswordComponent {
  email = ''; sent = false; error = '';
  constructor(private auth: AuthService) {}
  submit() {
    this.auth.forgotPassword(this.email).subscribe({
      next: () => this.sent = true,
      error: err => this.error = err.error?.message || 'Error'
    });
  }
}
