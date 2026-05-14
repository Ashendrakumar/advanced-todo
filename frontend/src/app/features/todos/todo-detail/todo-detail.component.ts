import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ShellComponent } from '../../../shared/components/shell/shell.component';
import { TodoService, SimpleTodo } from '../../../core/services/todo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, MatExpansionModule, ShellComponent],
  template: `
    <app-shell>
      @if (todo) {
        <div class="page">
          <div class="page-header">
            <div>
              <div class="breadcrumb"><a routerLink="/todos">Todos</a> / {{ todo.title }}</div>
              <h1>{{ todo.title }}</h1>
              @if (todo.description) { <p class="desc">{{ todo.description }}</p> }
            </div>
            <div class="vis-badge" [class]="todo.visibility">
              <mat-icon>{{ todo.visibility === 'public' ? 'public' : 'lock' }}</mat-icon>
              {{ todo.visibility }}
            </div>
          </div>

          <mat-card class="stats-card">
            <mat-card-content>
              <div class="stats-row">
                <span class="stat-val">{{ todo.stats.completed }}/{{ todo.stats.total }}</span>
                <span class="stat-lbl">items completed</span>
                <span class="pct">{{ todo.stats.percent }}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="todo.stats.percent" />
            </mat-card-content>
          </mat-card>

          @if (todo.useSteps) {
            <!-- Stepped mode -->
            @if (isOwner()) {
              <div class="add-step-row">
                <mat-form-field appearance="outline" class="step-field">
                  <mat-label>New Step title</mat-label>
                  <input matInput [(ngModel)]="newStepTitle" (keyup.enter)="addStep()" />
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="addStep()" [disabled]="!newStepTitle">Add Step</button>
              </div>
            }
            <mat-accordion multi>
              @for (step of todo.steps; track step._id) {
                <mat-expansion-panel [expanded]="true" class="step-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      {{ step.title }}
                      <span class="step-count">{{ completedInStep(step) }}/{{ step.items.length }}</span>
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="items-list">
                    @for (item of step.items; track item._id) {
                      <div class="item-row" [class.done]="item.isCompleted" (click)="toggle(step._id, item._id)">
                        <div class="cb" [class.checked]="item.isCompleted">
                          @if (item.isCompleted) { <mat-icon>check</mat-icon> }
                        </div>
                        <div class="ib">
                          <span class="it">{{ item.text }}</span>
                          @if (item.description) { <span class="id2">{{ item.description }}</span> }
                        </div>
                        @if (isOwner()) {
                          <button mat-icon-button color="warn" (click)="delItem($event, step._id, item._id)"><mat-icon>delete</mat-icon></button>
                        }
                      </div>
                    }
                    @if (isOwner()) {
                      @if (addItemStep === step._id) {
                        <div class="quick-add">
                          <mat-form-field appearance="outline" class="quick-field">
                            <input matInput [(ngModel)]="newItemText" placeholder="Item text" (keyup.enter)="addItem(step._id)" autofocus />
                          </mat-form-field>
                          <button mat-icon-button color="primary" (click)="addItem(step._id)"><mat-icon>check</mat-icon></button>
                          <button mat-icon-button (click)="addItemStep = ''"><mat-icon>close</mat-icon></button>
                        </div>
                      } @else {
                        <button mat-button color="primary" (click)="addItemStep = step._id; newItemText = ''">
                          <mat-icon>add</mat-icon> Add item
                        </button>
                      }
                    }
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
          } @else {
            <!-- Flat mode -->
            <mat-card class="flat-card">
              <mat-card-content>
                <div class="items-list">
                  @for (item of flatItems(); track item._id) {
                    <div class="item-row" [class.done]="item.isCompleted" (click)="toggle(todo.steps[0]._id, item._id)">
                      <div class="cb" [class.checked]="item.isCompleted">
                        @if (item.isCompleted) { <mat-icon>check</mat-icon> }
                      </div>
                      <div class="ib"><span class="it">{{ item.text }}</span></div>
                      @if (isOwner()) {
                        <button mat-icon-button color="warn" (click)="delItem($event, todo.steps[0]._id, item._id)"><mat-icon>delete</mat-icon></button>
                      }
                    </div>
                  }
                </div>
                @if (isOwner()) {
                  <div class="quick-add">
                    <mat-form-field appearance="outline" class="quick-field">
                      <input matInput [(ngModel)]="newItemText" placeholder="Add item..." (keyup.enter)="addFlatItem()" />
                    </mat-form-field>
                    <button mat-icon-button color="primary" (click)="addFlatItem()"><mat-icon>add</mat-icon></button>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </app-shell>
  `,
  styles: [`
    .page { max-width: 800px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .breadcrumb { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin-bottom: 4px; }
    .breadcrumb a { color: var(--mat-sys-primary); text-decoration: none; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .desc { margin: 0; color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .vis-badge { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .vis-badge.public { background: #e3f2fd; color: #1565c0; }
    .vis-badge.private { background: #f5f5f5; color: #424242; }
    .stats-card { margin-bottom: 20px; }
    .stats-card mat-card-content { padding: 16px !important; }
    .stats-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .stat-val { font-size: 22px; font-weight: 700; }
    .stat-lbl { font-size: 13px; color: var(--mat-sys-on-surface-variant); flex: 1; }
    .pct { font-size: 22px; font-weight: 700; color: var(--mat-sys-primary); }
    .add-step-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 14px;  }
    .step-field { flex: 1; }
    .step-panel { margin-bottom: 10px; }
    .step-count { margin-left: 10px; font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .items-list { display: flex; flex-direction: column; gap: 2px; }
    .item-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 8px; border-radius: 8px; cursor: pointer; transition: background .15s; }
    .item-row:hover { background: var(--mat-sys-surface-variant); }
    .item-row.done .it { text-decoration: line-through; opacity: .7; }
    .cb { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--mat-sys-outline); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .cb.checked { background: #388e3c; border-color: #388e3c; }
    .cb mat-icon { font-size: 14px; width: 14px; height: 14px; color: #fff; }
    .ib { flex: 1; }
    .it { font-size: 13px; display: block; }
    .id2 { font-size: 11px; color: var(--mat-sys-on-surface-variant); display: block; margin-top: 2px; }
    .quick-add { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
    .quick-field { flex: 1; }
    .flat-card mat-card-content { padding: 16px !important; }
  `]
})
export class TodoDetailComponent implements OnInit {
  todo: SimpleTodo | null = null;
  newStepTitle = ''; addItemStep = ''; newItemText = '';

  constructor(private route: ActivatedRoute, private ts: TodoService, private auth: AuthService, private snack: MatSnackBar) { }

  isOwner() {
    const user = this.auth.currentUser();
    return user?.role === 'admin' || this.todo?.owner._id === user?._id;
  }
  flatItems() { return this.todo?.steps[0]?.items || []; }
  completedInStep(step: any) { return step.items.filter((i: any) => i.isCompleted).length; }

  ngOnInit() { this.load(); }
  load() { this.ts.getTodo(this.route.snapshot.params['id']).subscribe(t => this.todo = t); }

  addStep() {
    if (!this.newStepTitle) return;
    this.ts.addStep(this.todo!._id, this.newStepTitle).subscribe(t => {
      console.log(t, '///');
      console.log(this.todo, '======');
      this.todo = t; this.newStepTitle = '';
    });
  }

  addItem(stepId: string) {
    if (!this.newItemText) return;
    this.ts.addItem(this.todo!._id, stepId, { text: this.newItemText }).subscribe(t => { this.todo = t; this.addItemStep = ''; this.newItemText = ''; });
  }

  addFlatItem() {
    if (!this.newItemText || !this.todo) return;
    if (this.todo.steps.length === 0) {
      this.ts.addItemFlat(this.todo._id, { text: this.newItemText }).subscribe(t => { this.todo = t; this.newItemText = ''; });
    } else {
      this.addItem(this.todo.steps[0]._id);
    }
  }

  toggle(stepId: string, itemId: string) {
    this.ts.toggleItem(this.todo!._id, stepId, itemId).subscribe(t => this.todo = t);
  }

  delItem(event: Event, stepId: string, itemId: string) {
    event.stopPropagation();
    this.ts.deleteItem(this.todo!._id, stepId, itemId).subscribe(t => this.todo = t);
  }
}
