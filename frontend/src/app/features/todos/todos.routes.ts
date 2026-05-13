import { Routes } from '@angular/router';

export const TODO_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./todo-list/todo-list.component').then(m => m.TodoListComponent) },
  { path: 'new', loadComponent: () => import('./todo-form/todo-form.component').then(m => m.TodoFormComponent) },
  { path: ':id', loadComponent: () => import('./todo-detail/todo-detail.component').then(m => m.TodoDetailComponent) },
];
