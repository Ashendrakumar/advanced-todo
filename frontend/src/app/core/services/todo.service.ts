import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

export interface TodoItem {
  _id: string;
  text: string;
  description: string;
  isCompleted: boolean;
  order: number;
}
export interface TodoStep {
  _id: string;
  title: string;
  items: TodoItem[];
  order: number;
}
export interface SimpleTodo {
  _id: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  useSteps: boolean;
  owner: { _id: string; name: string; email: string; avatar?: string };
  steps: TodoStep[];
  stats: { total: number; completed: number; percent: number };
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class TodoService {
  private api = `${environment.apiUrl}/todos`;
  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get<SimpleTodo[]>(this.api);
  }
  getTodo(id: string) {
    return this.http.get<SimpleTodo>(`${this.api}/${id}`);
  }
  createTodo(data: Partial<SimpleTodo>) {
    return this.http.post<SimpleTodo>(this.api, data);
  }
  updateTodo(id: string, data: Partial<SimpleTodo>) {
    return this.http.put<SimpleTodo>(`${this.api}/${id}`, data);
  }
  deleteTodo(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  addStep(id: string, title: string) {
    return this.http.post<SimpleTodo>(`${this.api}/${id}/steps`, { title });
  }
  addItem(id: string, stepId: string, data: Partial<TodoItem>) {
    return this.http.post<SimpleTodo>(
      `${this.api}/${id}/steps/${stepId}/items`,
      data,
    );
  }
  addItemFlat(id: string, data: Partial<TodoItem>) {
    return this.http.post<SimpleTodo>(`${this.api}/${id}/items`, data);
  }
  toggleItem(id: string, stepId: string, itemId: string) {
    return this.http.patch<SimpleTodo>(
      `${this.api}/${id}/steps/${stepId}/items/${itemId}/toggle`,
      {},
    );
  }
  deleteItem(id: string, stepId: string, itemId: string) {
    return this.http.delete<SimpleTodo>(
      `${this.api}/${id}/steps/${stepId}/items/${itemId}`,
    );
  }
}
