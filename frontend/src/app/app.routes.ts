import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "projects",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./features/projects/projects.routes").then(
        (m) => m.PROJECT_ROUTES,
      ),
  },
  {
    path: "todos",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./features/todos/todos.routes").then((m) => m.TODO_ROUTES),
  },
  {
    path: "admin",
    canActivate: [authGuard, roleGuard],
    data: { roles: ["admin"] },
    loadChildren: () =>
      import("./features/admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },
  { path: "**", redirectTo: "/dashboard" },
];
