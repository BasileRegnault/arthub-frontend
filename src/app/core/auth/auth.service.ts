import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // ---------- LOGIN ----------
  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/login`, {
      email,
      password
    }).pipe(
      tap(res => this.saveTokens(res.token, res.refresh_token))
    );
  }

  // ---------- REGISTER + AUTO LOGIN ----------
  register(email: string, username: string, password: string) {
    return this.http.post<any>(`${this.api}/register`, {
      email,
      username,
      password
    }).pipe(
      // auto login après register
      tap(() => this.login(email, password).subscribe())
    );
  }

  // ---------- REFRESH ----------
  refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<any>(`${this.api}/token/refresh`, {
      refresh_token: refresh
    }).pipe(
      tap(res => this.saveTokens(res.token, res.refresh_token))
    );
  }

  // ---------- TOKEN STORAGE ----------
  saveTokens(token: string, refresh?: string) {
    localStorage.setItem('token', token);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  // ---------- USER ----------
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): { username?: string; roles?: string[] } | null {
    const payload = this.decodeJwt();
    if (!payload) return null;

    return {
      username: payload.username,
      roles: payload.roles
    };
  }

  isAuthenticated(): boolean {
    const payload = this.decodeJwt();
    return !!payload && payload.exp * 1000 > Date.now();
  }

  decodeJwt(): any | null {
    const token = this.token;
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
