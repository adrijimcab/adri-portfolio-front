import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  photo_url?: string;
}

interface LoginResponse {
  data: {
    access_token: string;
    user: AuthUser;
  };
}

/**
 * AuthService — in-memory access token storage.
 *
 * Fase 3 / F-023 / F-024: the access token used to live in
 * `localStorage`, which made it trivially stealable via any XSS on a
 * page shipping `script-src 'unsafe-inline'`. It now lives purely in
 * memory: a private class field plus a public signal for the templates.
 *
 * Trade-off: on a hard refresh the admin has to log in again. That is
 * an acceptable cost for a single-operator portfolio — no refresh-token
 * dance, no cookie plumbing, no attack surface. If we ever need
 * session persistence we should put a refresh token in an httpOnly
 * cookie and mint short-lived access tokens from it.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  /** In-memory access token — never persisted to storage. */
  private accessTokenInMemory: string | null = null;

  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly accessToken = signal<string | null>(null);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  handleLoginSuccess(response: LoginResponse): void {
    const { access_token, user } = response.data;
    this.accessTokenInMemory = access_token;
    this.accessToken.set(access_token);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    const token = this.accessTokenInMemory;
    if (token) {
      this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.accessTokenInMemory = null;
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    void this.router.navigate(['/login']);
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }
}
