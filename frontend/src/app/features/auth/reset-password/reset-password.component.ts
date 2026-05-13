import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card"><mat-card-content>
        <div class="auth-header"><h1>Set New Password</h1></div>
        @if (done) {
          <div class="success-msg">Password reset! <a routerLink="/auth/login">Login</a></div>
        } @else {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" />
          </mat-form-field>
          @if (error) { <div class="error-msg">{{ error }}</div> }
          <button mat-raised-button color="primary" class="full-width" (click)="submit()">Reset Password</button>
        }
      </mat-card-content></mat-card>
    </div>`,
  styles: [`.auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--mat-sys-surface-variant);padding:16px}.auth-card{width:100%;max-width:420px;padding:8px}.auth-header{text-align:center;margin-bottom:24px}.full-width{width:100%}.success-msg{background:#e8f5e9;color:#2e7d32;padding:16px;border-radius:8px}.error-msg{background:#ffebee;color:#c62828;padding:10px;border-radius:8px;font-size:13px;margin-bottom:10px}`]
})
export class ResetPasswordComponent implements OnInit {
  password = ''; done = false; error = ''; token = '';
  constructor(private route: ActivatedRoute, private auth: AuthService) {}
  ngOnInit() { this.token = this.route.snapshot.params['token']; }
  submit() {
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => this.done = true,
      error: err => this.error = err.error?.message || 'Error'
    });
  }
}
