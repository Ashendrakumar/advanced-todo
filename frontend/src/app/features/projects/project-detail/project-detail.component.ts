import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { ShellComponent } from '../../../shared/components/shell/shell.component';
import { ProjectService, Project, Step, Item } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatDialogModule,
    MatMenuModule, MatSelectModule, MatSnackBarModule, MatTooltipModule, MatExpansionModule, ShellComponent],
  template: `
    <app-shell>
      @if (project) {
        <div class="page">
          <!-- Header -->
          <div class="proj-header">
            <div class="color-dot" [style.background]="project.color"></div>
            <div class="header-info">
              <div class="breadcrumb"><a routerLink="/projects">Projects</a> / {{ project.name }}</div>
              <h1>{{ project.name }}</h1>
              @if (project.description) { <p class="desc">{{ project.description }}</p> }
            </div>
            <div class="header-actions">
              @if (canEdit()) {
                <a mat-icon-button [routerLink]="['/projects', project._id, 'edit']" matTooltip="Edit Project">
                  <mat-icon>edit</mat-icon>
                </a>
              }
            </div>
          </div>

          <!-- Stats bar -->
          <mat-card class="stats-bar">
            <mat-card-content>
              <div class="stats-row">
                <div class="stat"><span class="sv">{{ project.stats.completed }}</span><span class="sl">Done</span></div>
                <div class="stat"><span class="sv">{{ project.stats.total }}</span><span class="sl">Total</span></div>
                <div class="stat"><span class="sv">{{ project.steps.length }}</span><span class="sl">Steps</span></div>
                <div class="stat"><span class="sv">{{ project.members.length }}</span><span class="sl">Members</span></div>
                <div class="stat pct-stat"><span class="sv pct-val">{{ project.stats.percent }}%</span><span class="sl">Complete</span></div>
              </div>
              <mat-progress-bar mode="determinate" [value]="project.stats.percent" color="primary" />
            </mat-card-content>
          </mat-card>

          <!-- Members section -->
          @if (canEdit()) {
            <mat-card class="members-card">
              <mat-card-content>
                <div class="members-header">
                  <h3>Team Members</h3>
                  <div class="invite-row">
                    <mat-form-field appearance="outline" class="invite-field">
                      <mat-label>Invite by email</mat-label>
                      <input matInput [(ngModel)]="inviteEmail" placeholder="user@example.com" (keyup.enter)="invite()" />
                      <mat-icon matPrefix>mail</mat-icon>
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="invite()" [disabled]="!inviteEmail">Invite</button>
                  </div>
                </div>
                <div class="members-list">
                  @for (m of project.members; track m.user._id) {
                    <div class="member-chip">
                      <div class="member-av">{{ m.user.name.charAt(0).toUpperCase() }}</div>
                      <div class="member-info">
                        <span class="mname">{{ m.user.name }}</span>
                        <span class="memail">{{ m.user.email }}</span>
                      </div>
                      <mat-chip class="mrole">{{ m.role }}</mat-chip>
                      @if (canEdit() && m.user._id !== project.owner._id) {
                        <button mat-icon-button (click)="removeMember(m.user._id)" matTooltip="Remove" color="warn"><mat-icon>person_remove</mat-icon></button>
                      }
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          <!-- Steps -->
          <div class="steps-header">
            <h2>Steps</h2>
            @if (canEdit()) {
              <button mat-raised-button color="primary" (click)="showAddStep = !showAddStep">
                <mat-icon>add</mat-icon> Add Step
              </button>
            }
          </div>

          @if (showAddStep) {
            <mat-card class="add-step-card">
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Step Title</mat-label>
                  <input matInput [(ngModel)]="newStep.title" (keyup.enter)="addStep()" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (optional)</mat-label>
                  <input matInput [(ngModel)]="newStep.description" />
                </mat-form-field>
                <div class="step-actions">
                  <button mat-stroked-button (click)="showAddStep = false">Cancel</button>
                  <button mat-raised-button color="primary" (click)="addStep()" [disabled]="!newStep.title">Add Step</button>
                </div>
              </mat-card-content>
            </mat-card>
          }

          <mat-accordion multi>
            @for (step of project.steps; track step._id) {
              <mat-expansion-panel class="step-panel" [expanded]="true">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <div class="step-title-row">
                      <div class="step-badge" [style.background]="step.color" [style.color]="step.textColor">
                        {{ stepIndex(step) + 1 }}
                      </div>
                      <span>{{ step.title }}</span>
                      <mat-chip class="item-count">{{ stepCompleted(step) }}/{{ step.items.length }}</mat-chip>
                    </div>
                  </mat-panel-title>
                  @if (canEdit()) {
                    <mat-panel-description>
                      <button mat-icon-button [matMenuTriggerFor]="stepMenu" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                      <mat-menu #stepMenu="matMenu">
                        <button mat-menu-item (click)="deleteStep(step._id)"><mat-icon color="warn">delete</mat-icon>Delete Step</button>
                      </mat-menu>
                    </mat-panel-description>
                  }
                </mat-expansion-panel-header>

                <div class="items-list">
                  @for (item of step.items; track item._id) {
                    <div class="item-row" [class.done]="item.isCompleted" (click)="toggleItem(step._id, item._id)">
                      <div class="item-checkbox" [class.checked]="item.isCompleted">
                        @if (item.isCompleted) { <mat-icon>check</mat-icon> }
                      </div>
                      <div class="item-body">
                        <span class="item-text">{{ item.text }}</span>
                        @if (item.description) { <span class="item-desc">{{ item.description }}</span> }
                      </div>
                      <div class="item-tags">
                        @if (item.tag && item.tag !== 'none') {
                          <span class="tag" [class]="'tag-' + item.tag">{{ item.tag }}</span>
                        }
                      </div>
                      @if (canEdit()) {
                        <button mat-icon-button (click)="deleteItem($event, step._id, item._id)" color="warn" class="del-btn">
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </div>
                  }

                  @if (canEdit()) {
                    @if (addItemStepId === step._id) {
                      <div class="add-item-form">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Item text</mat-label>
                          <input matInput [(ngModel)]="newItem.text" (keyup.enter)="addItem(step._id)" autofocus />
                        </mat-form-field>
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Description (optional)</mat-label>
                          <input matInput [(ngModel)]="newItem.description" />
                        </mat-form-field>
                        <mat-form-field appearance="outline" style="width:160px">
                          <mat-label>Tag</mat-label>
                          <mat-select [(ngModel)]="newItem.tag">
                            <mat-option value="none">None</mat-option>
                            <mat-option value="required">Required</mat-option>
                            <mat-option value="review">Review</mat-option>
                            <mat-option value="tip">Tip</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <div class="item-form-actions">
                          <button mat-stroked-button (click)="addItemStepId = ''">Cancel</button>
                          <button mat-raised-button color="primary" (click)="addItem(step._id)" [disabled]="!newItem.text">Add</button>
                        </div>
                      </div>
                    } @else {
                      <button mat-button color="primary" class="add-item-btn" (click)="addItemStepId = step._id; newItem = {text:'',description:'',tag:'none'}">
                        <mat-icon>add</mat-icon> Add Item
                      </button>
                    }
                  }
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        </div>
      } @else {
        <div class="loading">Loading...</div>
      }
    </app-shell>
  `,
  styles: [`
    .page { max-width: 900px; }
    .proj-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
    .color-dot { width: 14px; height: 14px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
    .header-info { flex: 1; }
    .breadcrumb { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin-bottom: 4px; }
    .breadcrumb a { color: var(--mat-sys-primary); text-decoration: none; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .desc { margin: 0; color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .stats-bar { margin-bottom: 16px; }
    .stats-bar mat-card-content { padding: 16px !important; }
    .stats-row { display: flex; gap: 24px; margin-bottom: 12px; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .sv { font-size: 22px; font-weight: 700; }
    .sl { font-size: 11px; color: var(--mat-sys-on-surface-variant); }
    .pct-val { color: var(--mat-sys-primary); }
    .members-card { margin-bottom: 20px; }
    .members-card mat-card-content { padding: 16px !important; }
    .members-header h3 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
    .invite-row { display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap; }
    .invite-field { flex: 1; min-width: 220px; }
    .members-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .member-chip { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); }
    .member-av { width: 32px; height: 32px; border-radius: 50%; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
    .member-info { flex: 1; min-width: 0; }
    .mname { display: block; font-size: 13px; font-weight: 600; }
    .memail { display: block; font-size: 11px; color: var(--mat-sys-on-surface-variant); }
    .mrole { font-size: 11px !important; }
    .steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    h2 { font-size: 20px; font-weight: 600; margin: 0; }
    .add-step-card { margin-bottom: 14px; }
    .add-step-card mat-card-content { padding: 16px !important; display: flex; flex-direction: column; gap: 12px; }
    .step-actions, .item-form-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .step-panel { margin-bottom: 10px; border-radius: 10px !important; overflow: hidden; }
    .step-title-row { display: flex; align-items: center; gap: 10px; }
    .step-badge { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
    .item-count { font-size: 11px !important; }
    .items-list { padding: 4px 0; }
    .item-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background .15s; border: 1px solid transparent; }
    .item-row:hover { background: var(--mat-sys-surface-variant); }
    .item-row.done { background: #f1f8e9; border-color: #c5e1a5; }
    .item-row.done .item-text { text-decoration: line-through; opacity: .7; }
    .item-checkbox { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--mat-sys-outline); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all .15s; }
    .item-checkbox.checked { background: #388e3c; border-color: #388e3c; }
    .item-checkbox mat-icon { font-size: 14px; width: 14px; height: 14px; color: #fff; }
    .item-body { flex: 1; }
    .item-text { font-size: 13px; display: block; }
    .item-desc { font-size: 11px; color: var(--mat-sys-on-surface-variant); display: block; margin-top: 2px; }
    .tag { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .tag-required { background: #ffebee; color: #c62828; }
    .tag-review { background: #fff8e1; color: #f57f17; }
    .tag-tip { background: #e3f2fd; color: #1565c0; }
    .del-btn { opacity: 0; transition: opacity .15s; }
    .item-row:hover .del-btn { opacity: 1; }
    .add-item-form { padding: 12px; border-radius: 8px; background: var(--mat-sys-surface-variant); margin-top: 8px; display: flex; flex-direction: column; gap: 10px; }
    .add-item-btn { width: 100%; margin-top: 4px; }
    .full-width { width: 100%; }
    .loading { padding: 60px; text-align: center; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  inviteEmail = '';
  showAddStep = false;
  addItemStepId = '';
  newStep = { title: '', description: '' };
  newItem: any = { text: '', description: '', tag: 'none' };

  constructor(private route: ActivatedRoute, private ps: ProjectService, private auth: AuthService, private snack: MatSnackBar) {}

  canEdit() { return ['admin', 'lead'].includes(this.auth.currentUser()?.role || ''); }
  stepIndex(step: Step) { return this.project!.steps.indexOf(step); }
  stepCompleted(step: Step) { return step.items.filter(i => i.isCompleted).length; }

  ngOnInit() { this.load(); }
  load() {
    const id = this.route.snapshot.params['id'];
    this.ps.getProject(id).subscribe(p => this.project = p);
  }

  invite() {
    if (!this.inviteEmail || !this.project) return;
    this.ps.inviteMember(this.project._id, this.inviteEmail).subscribe({
      next: (res) => { this.project = res.project; this.inviteEmail = ''; this.snack.open('Member invited!', '', { duration: 2500 }); },
      error: err => this.snack.open(err.error?.message || 'Error', '', { duration: 3000 })
    });
  }

  removeMember(userId: string) {
    this.ps.removeMember(this.project!._id, userId).subscribe(p => this.project = p);
  }

  addStep() {
    if (!this.newStep.title) return;
    this.ps.addStep(this.project!._id, this.newStep).subscribe(p => {
      this.project = p; this.showAddStep = false; this.newStep = { title: '', description: '' };
    });
  }

  deleteStep(stepId: string) {
    this.ps.deleteStep(this.project!._id, stepId).subscribe(p => this.project = p);
  }

  addItem(stepId: string) {
    if (!this.newItem.text) return;
    this.ps.addItem(this.project!._id, stepId, this.newItem).subscribe(p => {
      this.project = p; this.addItemStepId = ''; this.newItem = { text: '', description: '', tag: 'none' };
    });
  }

  toggleItem(stepId: string, itemId: string) {
    this.ps.toggleItem(this.project!._id, stepId, itemId).subscribe(p => this.project = p);
  }

  deleteItem(event: Event, stepId: string, itemId: string) {
    event.stopPropagation();
    this.ps.deleteItem(this.project!._id, stepId, itemId).subscribe(p => this.project = p);
  }
}
