import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px"><mat-spinner/><p>Signing you in...</p></div>`
})
export class CallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}
  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.auth.handleGoogleCallback(token).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.router.navigate(['/auth/login'], { queryParams: { error: 'oauth_failed' } })
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
