import { Component, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
  RouterModule,
} from "@angular/router";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatBadgeModule } from "@angular/material/badge";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" [opened]="!isMobile" class="sidenav">
        <div class="sidenav-header">
          <!-- <span class="logo">✅</span>
          <span class="app-name">Project Todo</span> -->
        </div>
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          @if (canSeeProjects()) {
            <a
              mat-list-item
              routerLink="/projects"
              routerLinkActive="active-link"
            >
              <mat-icon matListItemIcon>folder</mat-icon>
              <span matListItemTitle>Projects</span>
            </a>
          }
          <a mat-list-item routerLink="/todos" routerLinkActive="active-link">
            <mat-icon matListItemIcon>checklist</mat-icon>
            <span matListItemTitle>My Todos</span>
          </a>
          @if (isAdmin()) {
            <mat-divider style="margin:8px 0" />
            <a mat-list-item routerLink="/admin" routerLinkActive="active-link">
              <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
              <span matListItemTitle>Admin Panel</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info" [matMenuTriggerFor]="userMenu">
            <div class="avatar">{{ userInitial() }}</div>
            <div class="user-details">
              <span class="user-name">{{ user()?.name }}</span>
              <span class="user-role">{{ user()?.role }}</span>
            </div>
            <mat-icon>expand_more</mat-icon>
          </div>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="toggleTheme()">
              <mat-icon>{{ isDark() ? "light_mode" : "dark_mode" }}</mat-icon>
              {{ isDark() ? "Light Mode" : "Dark Mode" }}
            </button>
            <mat-divider />
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </mat-menu>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <button
            mat-icon-button
            (click)="toggleTheme()"
            [matTooltip]="isDark() ? 'Light mode' : 'Dark mode'"
          >
            <mat-icon>{{ isDark() ? "light_mode" : "dark_mode" }}</mat-icon>
          </button>
          <div class="role-badge" [class]="'role-' + user()?.role">
            {{ user()?.role }}
          </div>
        </mat-toolbar>
        <div class="content">
           <ng-content> </ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
      }
      .sidenav {
        width: 260px;
        border-right: 1px solid var(--mat-sys-outline-variant);
        display: flex;
        flex-direction: column;
      }
      .sidenav-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 16px 12px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .logo {
        font-size: 28px;
      }
      .app-name {
        font-size: 16px;
        font-weight: 700;
      }
      .active-link {
        background: var(--mat-sys-primary-container) !important;
        color: var(--mat-sys-on-primary-container) !important;
        border-radius: 8px;
      }
      .active-link mat-icon {
        color: var(--mat-sys-on-primary-container) !important;
      }
      .sidenav-footer {
        margin-top: auto;
        padding: 12px;
        border-top: 1px solid var(--mat-sys-outline-variant);
      }
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
      }
      .user-info:hover {
        background: var(--mat-sys-surface-variant);
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 15px;
        flex-shrink: 0;
      }
      .user-details {
        flex: 1;
        min-width: 0;
      }
      .user-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user-role {
        display: block;
        font-size: 11px;
        color: var(--mat-sys-on-surface-variant);
        text-transform: capitalize;
      }
      .toolbar {
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .toolbar-spacer {
        flex: 1;
      }
      .content {
        padding: 24px;
      }
      .role-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        margin-left: 8px;
      }
      .role-admin {
        background: #fce4ec;
        color: #880e4f;
      }
      .role-lead {
        background: #e8eaf6;
        color: #283593;
      }
      .role-user {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .role-guest {
        background: #fff8e1;
        color: #f57f17;
      }
    `,
  ],
})
export class ShellComponent {
  user = this.auth.user$;
  isDark = this.themeService.isDark;
  isMobile = window.innerWidth < 768;
  userInitial = computed(
    () => this.user()?.name?.charAt(0).toUpperCase() || "?",
  );
  isAdmin = computed(() => this.user()?.role === "admin");
  canSeeProjects = computed(() =>
    ["admin", "lead", "user"].includes(this.user()?.role || ""),
  );

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    private router: Router,
  ) { }

  toggleTheme() {
    this.themeService.toggle();
  }
  logout() {
    this.auth.logout();
  }
}
