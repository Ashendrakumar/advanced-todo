import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ShellComponent } from '../../shared/components/shell/shell.component';
import { UserService } from '../../core/services/user.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatChipsModule, MatTabsModule, ShellComponent],
  template: `
    <app-shell>
      <div class="page">
        <h1>Admin Panel</h1>

        <mat-tab-group>
          <!-- Users Tab -->
          <mat-tab label="Users ({{ users.length }})">
            <div class="tab-content">
              <div class="tab-header">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Search users</mat-label>
                  <input matInput [(ngModel)]="userSearch" />
                  <mat-icon matPrefix>search</mat-icon>
                </mat-form-field>
              </div>
              <div class="users-table">
                @for (user of filteredUsers(); track user._id) {
                  <mat-card class="user-row">
                    <mat-card-content>
                      <div class="user-av">{{ user.name.charAt(0).toUpperCase() }}</div>
                      <div class="user-info">
                        <div class="uname">{{ user.name }}</div>
                        <div class="uemail">{{ user.email }}</div>
                      </div>
                      <mat-chip [class]="'role-' + user.role">{{ user.role }}</mat-chip>
                      <mat-select [(ngModel)]="user.role" (ngModelChange)="changeRole(user, $event)" class="role-select">
                        <mat-option value="admin">admin</mat-option>
                        <mat-option value="lead">lead</mat-option>
                        <mat-option value="user">user</mat-option>
                        <mat-option value="guest">guest</mat-option>
                      </mat-select>
                      <button mat-icon-button color="warn" (click)="deleteUser(user._id)" [disabled]="user._id === me?._id">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Create Lead Tab -->
          <mat-tab label="Create Lead">
            <div class="tab-content">
              <mat-card class="form-card">
                <mat-card-content>
                  <h3>Invite a Lead by Email</h3>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Name</mat-label>
                    <input matInput [(ngModel)]="leadForm.name" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput [(ngModel)]="leadForm.email" type="email" />
                  </mat-form-field>
                  @if (leadMsg) { <div class="success-msg">{{ leadMsg }}</div> }
                  <button mat-raised-button color="primary" (click)="createLead()" [disabled]="!leadForm.email">
                    <mat-icon>send</mat-icon> Send Invite
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </app-shell>
  `,
  styles: [`
    .page { max-width: 1000px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 20px; }
    .tab-content { padding: 20px 0; }
    .tab-header { margin-bottom: 16px; }
    .search-field { min-width: 280px; }
    .users-table { display: flex; flex-direction: column; gap: 8px; }
    .user-row mat-card-content { padding: 12px 16px !important; display: flex; align-items: center; gap: 12px; }
    .user-av { width: 36px; height: 36px; border-radius: 50%; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .user-info { flex: 1; min-width: 0; }
    .uname { font-weight: 600; font-size: 14px; }
    .uemail { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .role-select { width: 100px; }
    .role-admin { background: #fce4ec !important; color: #880e4f !important; }
    .role-lead { background: #e8eaf6 !important; color: #283593 !important; }
    .role-user { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .role-guest { background: #fff8e1 !important; color: #f57f17 !important; }
    .form-card mat-card-content { padding: 24px !important; display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .success-msg { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 8px; }
  `]
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  userSearch = '';
  me = this.auth.currentUser();
  leadForm = { name: '', email: '' };
  leadMsg = '';

  constructor(private userService: UserService, private auth: AuthService, private snack: MatSnackBar) {}

  filteredUsers() { return this.users.filter(u => u.name.toLowerCase().includes(this.userSearch.toLowerCase()) || u.email.toLowerCase().includes(this.userSearch.toLowerCase())); }

  ngOnInit() { this.userService.getAll().subscribe(u => this.users = u); }

  changeRole(user: User, role: string) {
    this.userService.updateRole(user._id, role).subscribe({
      next: (u) => { this.snack.open(`Role updated to ${u.role}`, '', { duration: 2000 }); },
      error: err => this.snack.open(err.error?.message || 'Error', '', { duration: 3000 })
    });
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: () => { this.users = this.users.filter(u => u._id !== id); this.snack.open('User deleted', '', { duration: 2000 }); },
      error: err => this.snack.open(err.error?.message || 'Error', '', { duration: 3000 })
    });
  }

  createLead() {
    this.userService.createLead(this.leadForm.email, this.leadForm.name).subscribe({
      next: () => { this.leadMsg = `Invite sent to ${this.leadForm.email}`; this.leadForm = { name: '', email: '' }; },
      error: err => this.snack.open(err.error?.message || 'Error', '', { duration: 3000 })
    });
  }
}
