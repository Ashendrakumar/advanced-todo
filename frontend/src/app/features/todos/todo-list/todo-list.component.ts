import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ShellComponent } from '../../../shared/components/shell/shell.component';
import { TodoService, SimpleTodo } from '../../../core/services/todo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, ShellComponent],
  template: `
    <app-shell>
      <div class="page">
        <div class="page-header">
          <h1>My Todos</h1>
          <a mat-raised-button color="primary" routerLink="/todos/new">
            <mat-icon>add</mat-icon> New Todo
          </a>
        </div>

        <div class="filter-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" />
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          <div class="filter-chips">
            <button mat-stroked-button [class.active-filter]="filter === 'all'" (click)="filter = 'all'">All</button>
            <button mat-stroked-button [class.active-filter]="filter === 'private'" (click)="filter = 'private'">
              <mat-icon>lock</mat-icon> Private
            </button>
            <button mat-stroked-button [class.active-filter]="filter === 'public'" (click)="filter = 'public'">
              <mat-icon>public</mat-icon> Public
            </button>
          </div>
        </div>

        <div class="todos-grid">
          @for (todo of filtered(); track todo._id) {
            <mat-card class="todo-card" [routerLink]="['/todos', todo._id]">
              <mat-card-content>
                <div class="card-header">
                  <mat-icon [class]="todo.visibility === 'public' ? 'pub' : 'priv'">
                    {{ todo.visibility === 'public' ? 'public' : 'lock' }}
                  </mat-icon>
                  <div class="todo-meta">
                    <div class="todo-title">{{ todo.title }}</div>
                    <div class="todo-owner">by {{ todo.owner.name }}</div>
                  </div>
                  @if (isOwner(todo)) {
                    <button mat-icon-button color="warn" (click)="delete(todo._id, $event)"><mat-icon>delete</mat-icon></button>
                  }
                </div>
                @if (todo.description) { <p class="todo-desc">{{ todo.description }}</p> }
                <div class="progress-row">
                  <span>{{ todo.stats.completed }}/{{ todo.stats.total }} items</span>
                  <span class="pct">{{ todo.stats.percent }}%</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="todo.stats.percent" />
                <!-- <a mat-button color="primary"  class="view-btn">View →</a> -->
              </mat-card-content>
            </mat-card>
          }
          @empty {
            <div class="empty"><mat-icon>checklist</mat-icon><p>No todos yet. Create one!</p></div>
          }
        </div>
      </div>
    </app-shell>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0; }
    .filter-row { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 20px; }
    .search-field { min-width: 220px; }
    .filter-chips { display: flex; gap: 8px; padding-top: 4px; }
    .active-filter { background: var(--mat-sys-primary-container) !important; color: var(--mat-sys-on-primary-container) !important; }
    .todos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .todo-card mat-card-content { padding: 16px !important; cursor: pointer }
    .card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .pub { color: #1976d2; margin-top: 2px; }
    .priv { color: var(--mat-sys-on-surface-variant); margin-top: 2px; }
    .todo-meta { flex: 1; }
    .todo-title { font-weight: 600; font-size: 15px; }
    .todo-owner { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .todo-desc { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 0 0 12px; }
    .progress-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--mat-sys-on-surface-variant); margin-bottom: 6px; }
    .pct { font-weight: 700; color: var(--mat-sys-primary); }
    .view-btn { margin-top: 8px; display: block; }
    .empty { grid-column: 1/-1; text-align: center; padding: 60px; color: var(--mat-sys-on-surface-variant); }
    .empty mat-icon { font-size: 56px; width: 56px; height: 56px; }
  `]
})
export class TodoListComponent implements OnInit {
  todos: SimpleTodo[] = [];
  search = ''; filter = 'all';

  constructor(private ts: TodoService, private auth: AuthService, private snack: MatSnackBar) {
  }

  isOwner(todo: SimpleTodo) {
    const user = this.auth.currentUser();
    return user?.role === 'admin' || todo.owner._id === user?._id;
  }

  filtered() {
    return this.todos.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(this.search.toLowerCase());
      const matchFilter = this.filter === 'all' || t.visibility === this.filter;
      return matchSearch && matchFilter;
    });
  }

  ngOnInit() { this.ts.getTodos().subscribe(t => this.todos = t); }

  delete(id: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.ts.deleteTodo(id).subscribe({
      next: () => { this.todos = this.todos.filter(t => t._id !== id); this.snack.open('Deleted', '', { duration: 2000 }); },
      error: err => this.snack.open(err.error?.message || 'Error', '', { duration: 3000 })
    });
  }
}
