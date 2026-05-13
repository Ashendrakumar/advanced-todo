import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { ShellComponent } from '../../shared/components/shell/shell.component';
import { ProjectService, DashboardStats } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { TodoService, SimpleTodo } from '../../core/services/todo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule, ShellComponent],
  template: `
    <app-shell>
      <div class="dashboard">
        <div class="page-header">
          <div>
            <h1>Welcome back, {{ user?.name }} 👋</h1>
            <p class="subtitle">Here's your overview</p>
          </div>
          <div class="header-actions">
            @if (canCreateProject()) {
              <a mat-raised-button color="primary" routerLink="/projects/new">
                <mat-icon>add</mat-icon> New Project
              </a>
            }
            <a mat-stroked-button routerLink="/todos/new">
              <mat-icon>add</mat-icon> New Todo
            </a>
          </div>
        </div>

        <!-- Stats Cards -->
        @if (stats) {
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon blue"><mat-icon>folder</mat-icon></div>
                <div class="stat-val">{{ stats.totalProjects }}</div>
                <div class="stat-lbl">Total Projects</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon green"><mat-icon>play_circle</mat-icon></div>
                <div class="stat-val">{{ stats.activeProjects }}</div>
                <div class="stat-lbl">Active</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon purple"><mat-icon>check_circle</mat-icon></div>
                <div class="stat-val">{{ stats.completedProjects }}</div>
                <div class="stat-lbl">Completed</div>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon orange"><mat-icon>task_alt</mat-icon></div>
                <div class="stat-val">{{ stats.completedItems }}/{{ stats.totalItems }}</div>
                <div class="stat-lbl">Items Done</div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Overall Progress -->
          <mat-card class="progress-card">
            <mat-card-content>
              <div class="progress-header">
                <span class="progress-title">Overall Progress</span>
                <span class="progress-pct">{{ stats.overallPercent }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="stats.overallPercent" color="primary" />
              <p class="progress-sub">{{ stats.completedItems }} of {{ stats.totalItems }} items completed across all projects</p>
            </mat-card-content>
          </mat-card>

          <!-- Projects List -->
          @if (stats.projects.length > 0) {
            <h2 class="section-title">Projects</h2>
            <div class="projects-grid">
              @for (p of stats.projects; track p._id) {
                <a [routerLink]="['/projects', p._id]" class="project-card-link">
                  <mat-card class="project-card">
                    <mat-card-content>
                      <div class="project-color-bar" [style.background]="p.color"></div>
                      <div class="project-info">
                        <div class="project-name">{{ p.name }}</div>
                        <mat-chip-set>
                          <mat-chip [class]="'status-' + p.status" highlighted>{{ p.status }}</mat-chip>
                        </mat-chip-set>
                        <div class="project-progress">
                          <div class="progress-nums">{{ p.stats.completed }}/{{ p.stats.total }} items
                            <span class="pct-badge">{{ p.stats.percent }}%</span>
                          </div>
                          <mat-progress-bar mode="determinate" [value]="p.stats.percent" />
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </a>
              }
            </div>
          }
        }

        <!-- Recent Todos -->
        @if (todos.length > 0) {
          <h2 class="section-title">Recent Todos</h2>
          <div class="todos-list">
            @for (todo of todos.slice(0, 5); track todo._id) {
              <a [routerLink]="['/todos', todo._id]" class="todo-row-link">
                <mat-card class="todo-row">
                  <mat-card-content>
                    <div class="todo-left">
                      <mat-icon [class]="todo.visibility === 'public' ? 'pub-icon' : 'priv-icon'">
                        {{ todo.visibility === 'public' ? 'public' : 'lock' }}
                      </mat-icon>
                      <div>
                        <div class="todo-title">{{ todo.title }}</div>
                        <div class="todo-sub">{{ todo.stats.completed }}/{{ todo.stats.total }} items</div>
                      </div>
                    </div>
                    <div class="todo-pct">{{ todo.stats.percent }}%</div>
                  </mat-card-content>
                </mat-card>
              </a>
            }
            <a mat-button routerLink="/todos" color="primary">View all todos →</a>
          </div>
        }
      </div>
    </app-shell>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--mat-sys-on-surface-variant); margin: 0; }
    .header-actions { display: flex; gap: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card mat-card-content { padding: 20px !important; }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .stat-icon mat-icon { color: #fff; }
    .blue { background: #1976d2; } .green { background: #388e3c; } .purple { background: #7b1fa2; } .orange { background: #f57c00; }
    .stat-val { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .stat-lbl { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .progress-card { margin-bottom: 28px; }
    .progress-card mat-card-content { padding: 20px !important; }
    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .progress-title { font-weight: 600; font-size: 15px; }
    .progress-pct { font-size: 22px; font-weight: 700; color: var(--mat-sys-primary); }
    .progress-sub { font-size: 12px; color: var(--mat-sys-on-surface-variant); margin-top: 8px; margin-bottom: 0; }
    .section-title { font-size: 18px; font-weight: 600; margin: 0 0 14px; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .project-card-link { text-decoration: none; }
    .project-card { cursor: pointer; transition: box-shadow .2s; }
    .project-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.15); }
    .project-card mat-card-content { padding: 0 !important; overflow: hidden; }
    .project-color-bar { height: 4px; }
    .project-info { padding: 16px; }
    .project-name { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
    .project-progress { margin-top: 12px; }
    .progress-nums { display: flex; justify-content: space-between; font-size: 12px; color: var(--mat-sys-on-surface-variant); margin-bottom: 6px; }
    .pct-badge { font-weight: 700; color: var(--mat-sys-primary); }
    .status-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-completed { background: #e3f2fd !important; color: #1565c0 !important; }
    .status-archived { background: #f5f5f5 !important; color: #757575 !important; }
    .todos-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
    .todo-row-link { text-decoration: none; }
    .todo-row mat-card-content { padding: 12px 16px !important; display: flex; align-items: center; justify-content: space-between; }
    .todo-left { display: flex; align-items: center; gap: 12px; }
    .todo-title { font-weight: 500; font-size: 14px; }
    .todo-sub { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .todo-pct { font-weight: 700; color: var(--mat-sys-primary); font-size: 15px; }
    .pub-icon { color: #1976d2; } .priv-icon { color: var(--mat-sys-on-surface-variant); }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  todos: SimpleTodo[] = [];
  user = this.auth.currentUser();

  constructor(private projectService: ProjectService, private todoService: TodoService, private auth: AuthService) {}

  canCreateProject() { return ['admin', 'lead'].includes(this.user?.role || ''); }

  ngOnInit() {
    if (['admin', 'lead', 'user'].includes(this.user?.role || '')) {
      this.projectService.getDashboard().subscribe(s => this.stats = s);
    }
    this.todoService.getTodos().subscribe(t => this.todos = t);
  }
}
