import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

interface MeResponse {
  data: AuthUser;
}

const TOKEN_KEY = 'portfolio_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;

  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly accessToken = signal<string | null>(null);

  constructor() {
    this.checkAuth();
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe();
  }

  handleLoginSuccess(response: LoginResponse): void {
    const { access_token, user } = response.data;
    this.accessToken.set(access_token);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, access_token);
    }
  }

  logout(): void {
    const token = this.accessToken();
    if (token) {
      this.http.post(`${this.baseUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  checkAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    this.accessToken.set(token);
    this.http.get<MeResponse>(`${this.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (res) => {
        this.currentUser.set(res.data);
        this.isAuthenticated.set(true);
      },
      error: () => {
        this.accessToken.set(null);
        localStorage.removeItem(TOKEN_KEY);
      },
    });
  }
}
