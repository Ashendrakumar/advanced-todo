import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card"><mat-card-content>
        <div class="auth-header"><h1>Accept Invitation</h1><p>Set your password to join</p></div>
        @if (done) {
          <div class="success-msg">Account activated! <a routerLink="/auth/login">Login now</a></div>
        } @else {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Your Name</mat-label>
            <input matInput [(ngModel)]="name" name="name" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" />
          </mat-form-field>
          @if (error) { <div class="error-msg">{{ error }}</div> }
          <button mat-raised-button color="primary" class="full-width" (click)="submit()">Activate Account</button>
        }
      </mat-card-content></mat-card>
    </div>`,
  styles: [`.auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--mat-sys-surface-variant);padding:16px}.auth-card{width:100%;max-width:420px;padding:8px}.auth-header{text-align:center;margin-bottom:24px}.full-width{width:100%}.success-msg{background:#e8f5e9;color:#2e7d32;padding:16px;border-radius:8px}.error-msg{background:#ffebee;color:#c62828;padding:10px;border-radius:8px;font-size:13px;margin-bottom:10px}`]
})
export class AcceptInviteComponent {
  name = ''; password = ''; done = false; error = ''; token = '';
  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.token = this.route.snapshot.params['token'];
  }
  submit() {
    this.http.post(`${environment.apiUrl}/auth/accept-invite`, { token: this.token, name: this.name, password: this.password }).subscribe({
      next: () => this.done = true,
      error: err => this.error = err.error?.message || 'Error'
    });
  }
}
