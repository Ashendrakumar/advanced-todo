import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Item {
  _id: string; text: string; description: string;
  tag: 'required' | 'review' | 'tip' | 'none';
  isCompleted: boolean; order: number;
}
export interface Step {
  _id: string; title: string; description: string;
  color: string; textColor: string; order: number; items: Item[];
}
export interface ProjectMember {
  user: { _id: string; name: string; email: string; avatar?: string; role: string };
  role: string; addedAt: string;
}
export interface Project {
  _id: string; name: string; description: string; color: string;
  isPublic: boolean; status: string;
  owner: { _id: string; name: string; email: string };
  lead: { _id: string; name: string; email: string };
  members: ProjectMember[]; steps: Step[];
  stats: { total: number; completed: number; percent: number };
  createdAt: string;
}
export interface DashboardStats {
  totalProjects: number; activeProjects: number; completedProjects: number;
  totalItems: number; completedItems: number; overallPercent: number;
  projects: { _id: string; name: string; color: string; status: string; stats: any }[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private api = `${environment.apiUrl}/projects`;
  constructor(private http: HttpClient) {}

  getDashboard() { return this.http.get<DashboardStats>(`${this.api}/dashboard`); }
  getProjects() { return this.http.get<Project[]>(this.api); }
  getProject(id: string) { return this.http.get<Project>(`${this.api}/${id}`); }
  createProject(data: Partial<Project>) { return this.http.post<Project>(this.api, data); }
  updateProject(id: string, data: Partial<Project>) { return this.http.put<Project>(`${this.api}/${id}`, data); }
  deleteProject(id: string) { return this.http.delete(`${this.api}/${id}`); }
  inviteMember(id: string, email: string) { return this.http.post<{ project: Project }>(`${this.api}/${id}/invite`, { email }); }
  removeMember(id: string, userId: string) { return this.http.delete<Project>(`${this.api}/${id}/members/${userId}`); }

  addStep(projectId: string, data: Partial<Step>) { return this.http.post<Project>(`${this.api}/${projectId}/steps`, data); }
  updateStep(projectId: string, stepId: string, data: Partial<Step>) { return this.http.put<Project>(`${this.api}/${projectId}/steps/${stepId}`, data); }
  deleteStep(projectId: string, stepId: string) { return this.http.delete<Project>(`${this.api}/${projectId}/steps/${stepId}`); }

  addItem(projectId: string, stepId: string, data: Partial<Item>) { return this.http.post<Project>(`${this.api}/${projectId}/steps/${stepId}/items`, data); }
  updateItem(projectId: string, stepId: string, itemId: string, data: Partial<Item>) { return this.http.put<Project>(`${this.api}/${projectId}/steps/${stepId}/items/${itemId}`, data); }
  toggleItem(projectId: string, stepId: string, itemId: string) { return this.http.patch<Project>(`${this.api}/${projectId}/steps/${stepId}/items/${itemId}/toggle`, {}); }
  deleteItem(projectId: string, stepId: string, itemId: string) { return this.http.delete<Project>(`${this.api}/${projectId}/steps/${stepId}/items/${itemId}`); }
}
