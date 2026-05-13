import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ShellComponent } from '../../../shared/components/shell/shell.component';
import { ProjectService } from '../../../core/services/project.service';

const COLORS = ['#4F46E5','#7C3AED','#0F766E','#B45309','#BE123C','#15803D','#1D4ED8','#C026D3'];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, ShellComponent],
  template: `
    <app-shell>
      <div class="page">
        <div class="page-header">
          <h1>{{ isEdit ? 'Edit Project' : 'New Project' }}</h1>
          <a mat-icon-button routerLink="/projects"><mat-icon>close</mat-icon></a>
        </div>
        <mat-card class="form-card">
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Project Name</mat-label>
              <input matInput [(ngModel)]="form.name" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="form.description" rows="3"></textarea>
            </mat-form-field>
            <div class="color-section">
              <label class="field-label">Project Color</label>
              <div class="color-grid">
                @for (c of colors; track c) {
                  <div class="color-swatch" [style.background]="c" [class.selected]="form.color === c" (click)="form.color = c">
                    @if (form.color === c) { <mat-icon>check</mat-icon> }
                  </div>
                }
              </div>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="form.status">
                <mat-option value="active">Active</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="archived">Archived</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-slide-toggle [(ngModel)]="form.isPublic" color="primary">Public Project</mat-slide-toggle>
            <div class="form-actions">
              <a mat-stroked-button routerLink="/projects">Cancel</a>
              <button mat-raised-button color="primary" (click)="submit()" [disabled]="!form.name || loading">
                {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create Project') }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-shell>
  `,
  styles: [`
    .page { max-width: 620px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .form-card mat-card-content { padding: 24px !important; display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .color-section { }
    .field-label { font-size: 13px; color: var(--mat-sys-on-surface-variant); display: block; margin-bottom: 10px; }
    .color-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .color-swatch { width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 3px solid transparent; transition: transform .15s; }
    .color-swatch:hover { transform: scale(1.1); }
    .color-swatch.selected { border-color: var(--mat-sys-outline); }
    .color-swatch mat-icon { color: #fff; font-size: 18px; width: 18px; height: 18px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class ProjectFormComponent implements OnInit {
  isEdit = false; loading = false;
  colors = COLORS;
  form = { name: '', description: '', color: COLORS[0], status: 'active', isPublic: false };

  constructor(private ps: ProjectService, private route: ActivatedRoute, private router: Router, private snack: MatSnackBar) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.ps.getProject(id).subscribe(p => {
        this.form = { name: p.name, description: p.description, color: p.color, status: p.status, isPublic: p.isPublic };
      });
    }
  }

  submit() {
    this.loading = true;
    const id = this.route.snapshot.params['id'];
    const obs = this.isEdit ? this.ps.updateProject(id, this.form) : this.ps.createProject(this.form);
    obs.subscribe({
      next: (p) => { this.snack.open(this.isEdit ? 'Updated!' : 'Project created!', '', { duration: 2500 }); this.router.navigate(['/projects', p._id]); },
      error: err => { this.snack.open(err.error?.message || 'Error', '', { duration: 3000 }); this.loading = false; }
    });
  }
}
