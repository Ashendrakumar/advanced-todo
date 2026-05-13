import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ShellComponent } from "../../../shared/components/shell/shell.component";
import { SimpleTodo, TodoService } from "../../../core/services/todo.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-todo-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    ShellComponent,
  ],
  template: `
    <app-shell>
      <div class="page">
        <div class="page-header">
          <h1>New Todo</h1>
          <a mat-icon-button routerLink="/todos"><mat-icon>close</mat-icon></a>
        </div>
        <mat-card class="form-card">
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="form.title" required />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description (optional)</mat-label>
              <textarea
                matInput
                [(ngModel)]="form.description"
                rows="3"
              ></textarea>
            </mat-form-field>
            @if (!isGuest()) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Visibility</mat-label>
                <mat-select [(ngModel)]="form.visibility">
                  <mat-option value="private"
                    ><mat-icon>lock</mat-icon> Private</mat-option
                  >
                  <mat-option value="public"
                    ><mat-icon>public</mat-icon> Public</mat-option
                  >
                </mat-select>
              </mat-form-field>
            }
            <mat-slide-toggle [(ngModel)]="form.useSteps" color="primary"
              >Use Steps (organize items into sections)</mat-slide-toggle
            >
            <div class="form-actions">
              <a mat-stroked-button routerLink="/todos">Cancel</a>
              <button
                mat-raised-button
                color="primary"
                (click)="submit()"
                [disabled]="!form.title || loading"
              >
                {{ loading ? "Creating..." : "Create Todo" }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-shell>
  `,
  styles: [
    `
      .page {
        max-width: 580px;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      h1 {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }
      .form-card mat-card-content {
        padding: 24px !important;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class TodoFormComponent {
  loading = false;
  form: Partial<SimpleTodo> = {
    title: "",
    description: "",
    visibility: "private",
    useSteps: false,
  };
  constructor(
    private ts: TodoService,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  isGuest() {
    return this.auth.currentUser()?.role === "guest";
  }

  submit() {
    this.loading = true;
    this.ts.createTodo(this.form).subscribe({
      next: (t) => {
        this.snack.open("Todo created!", "", { duration: 2000 });
        this.router.navigate(["/todos", t._id]);
      },
      error: (err) => {
        this.snack.open(err.error?.message || "Error", "", { duration: 3000 });
        this.loading = false;
      },
    });
  }
}
