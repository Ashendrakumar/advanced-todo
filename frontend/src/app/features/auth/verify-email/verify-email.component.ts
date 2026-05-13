import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-content class="center">
          @if (loading) { <mat-spinner /> <p>Verifying...</p> }
          @else if (success) {
            <mat-icon class="big-icon success">check_circle</mat-icon>
            <h2>Email Verified!</h2>
            <p>Your email has been verified successfully.</p>
            <a mat-raised-button color="primary" routerLink="/auth/login">Go to Login</a>
          } @else {
            <mat-icon class="big-icon error">error</mat-icon>
            <h2>Verification Failed</h2>
            <p>{{ error }}</p>
            <a mat-stroked-button routerLink="/auth/login">Back to Login</a>
          }
        </mat-card-content>
      </mat-card>
    </div>`,
  styles: [`.auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--mat-sys-surface-variant);padding:16px}.auth-card{width:100%;max-width:400px}.center{text-align:center;padding:32px}.big-icon{font-size:64px;width:64px;height:64px;margin-bottom:16px}.success{color:#4caf50}.error{color:#f44336}h2{margin-bottom:8px}p{color:var(--mat-sys-on-surface-variant);margin-bottom:20px}`]
})
export class VerifyEmailComponent implements OnInit {
  loading = true; success = false; error = '';
  constructor(private route: ActivatedRoute, private auth: AuthService) {}
  ngOnInit() {
    const token = this.route.snapshot.params['token'];
    this.auth.verifyEmail(token).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: err => { this.error = err.error?.message || 'Verification failed'; this.loading = false; }
    });
  }
}
