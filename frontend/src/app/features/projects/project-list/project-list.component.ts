import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ShellComponent } from '../../../shared/components/shell/shell.component';
import { ProjectService, Project } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule, MatInputModule, MatFormFieldModule, ShellComponent],
  template: `
    <app-shell>
      <div class="page">
        <div class="page-header">
          <h1>Projects</h1>
          @if (canCreate()) {
            <a mat-raised-button color="primary" routerLink="/projects/new">
              <mat-icon>add</mat-icon> New Project
            </a>
          }
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search projects</mat-label>
          <input matInput [(ngModel)]="search" placeholder="Type to filter..." />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <div class="projects-grid">
          @for (p of filtered(); track p._id) {
            <a [routerLink]="['/projects', p._id]" class="card-link">
              <mat-card class="project-card">
                <div class="color-bar" [style.background]="p.color"></div>
                <mat-card-content>
                  <div class="card-top">
                    <span class="proj-name">{{ p.name }}</span>
                    <mat-chip [class]="'s-' + p.status">{{ p.status }}</mat-chip>
                  </div>
                  <p class="proj-desc">{{ p.description || 'No description' }}</p>
                  <div class="members-row">
                    @for (m of p.members.slice(0, 3); track m.user._id) {
                      <div class="member-av" [title]="m.user.name">{{ m.user.name.charAt(0).toUpperCase() }}</div>
                    }
                    @if (p.members.length > 3) {
                      <div class="member-av more">+{{ p.members.length - 3 }}</div>
                    }
                  </div>
                  <div class="progress-row">
                    <span class="prog-text">{{ p.stats.completed }}/{{ p.stats.total }} items</span>
                    <span class="prog-pct">{{ p.stats.percent }}%</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="p.stats.percent" />
                </mat-card-content>
              </mat-card>
            </a>
          }
          @empty {
            <div class="empty">
              <mat-icon>folder_open</mat-icon>
              <p>No projects found</p>
            </div>
          }
        </div>
      </div>
    </app-shell>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0; }
    .search-field { width: 100%; max-width: 400px; margin-bottom: 20px; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card-link { text-decoration: none; }
    .project-card { cursor: pointer; transition: box-shadow .2s; overflow: hidden; }
    .project-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.15); }
    .color-bar { height: 5px; }
    mat-card-content { padding: 16px !important; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .proj-name { font-weight: 600; font-size: 16px; }
    .proj-desc { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 0 0 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .members-row { display: flex; gap: 4px; margin-bottom: 12px; }
    .member-av { width: 28px; height: 28px; border-radius: 50%; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
    .more { background: var(--mat-sys-outline); color: var(--mat-sys-on-surface); font-size: 10px; }
    .progress-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: var(--mat-sys-on-surface-variant); }
    .prog-pct { font-weight: 700; color: var(--mat-sys-primary); }
    .s-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .s-completed { background: #e3f2fd !important; color: #1565c0 !important; }
    .s-archived { background: #f5f5f5 !important; color: #757575 !important; }
    .empty { grid-column: 1/-1; text-align: center; padding: 60px; color: var(--mat-sys-on-surface-variant); }
    .empty mat-icon { font-size: 56px; width: 56px; height: 56px; }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  search = '';

  constructor(private ps: ProjectService, private auth: AuthService) {}

  canCreate() { return ['admin', 'lead'].includes(this.auth.currentUser()?.role || ''); }
  filtered() { return this.projects.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase())); }

  ngOnInit() { this.ps.getProjects().subscribe(p => this.projects = p); }
}
