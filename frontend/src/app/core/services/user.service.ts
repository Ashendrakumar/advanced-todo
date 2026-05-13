import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<User[]>(this.api); }
  updateRole(id: string, role: string) { return this.http.put<User>(`${this.api}/${id}/role`, { role }); }
  createLead(email: string, name: string) { return this.http.post<{ user: User }>(`${this.api}/leads`, { email, name }); }
  deleteUser(id: string) { return this.http.delete(`${this.api}/${id}`); }
  updateProfile(data: { name?: string; avatar?: string }) { return this.http.put<User>(`${this.api}/profile`, data); }
}
