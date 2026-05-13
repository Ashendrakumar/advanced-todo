import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'lead' | 'user' | 'guest';
  avatar?: string;
  isVerified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private _user = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }

  currentUser() { return this._user(); }
  user$ = this._user;
  isLoggedIn() { return !!this.getToken() && !!this._user(); }
  getToken() { return localStorage.getItem('token'); }

  hasRole(...roles: string[]) {
    const user = this._user();
    return user ? roles.includes(user.role) : false;
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: User }>(`${this.api}/login`, { email, password })
      .pipe(tap(res => this.storeSession(res.token, res.user)));
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.api}/register`, { name, email, password });
  }

  verifyEmail(token: string) {
    return this.http.get(`${this.api}/verify-email/${token}`);
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`${this.api}/reset-password`, { token, password });
  }

  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleGoogleCallback(token: string) {
    return this.http.get<User>(`${this.api}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(tap(user => this.storeSession(token, user)));
  }

  guestLogin() {
    return this.http.post<{ token: string; user: User }>(`${this.api}/guest`, {})
      .pipe(tap(res => this.storeSession(res.token, res.user)));
  }

  refreshProfile() {
    return this.http.get<User>(`${this.api}/me`)
      .pipe(tap(user => { this._user.set(user); localStorage.setItem('user', JSON.stringify(user)); }));
  }

  private storeSession(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }
}
