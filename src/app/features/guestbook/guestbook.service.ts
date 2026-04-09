import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';

export interface GuestbookEntry {
  readonly id: string;
  readonly github_username: string;
  readonly github_avatar_url: string;
  readonly message: string;
  readonly created_at: string;
}

export interface GuestbookAuthResponse {
  readonly access_token: string;
  readonly username: string;
  readonly avatar_url: string;
}

@Injectable({ providedIn: 'root' })
export class GuestbookService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/guestbook`;

  listEntries(): Observable<GuestbookEntry[]> {
    return this.http.get<ApiResponse<GuestbookEntry[]>>(this.baseUrl).pipe(map((res) => res.data));
  }

  exchangeCode(code: string): Observable<GuestbookAuthResponse> {
    return this.http
      .post<ApiResponse<GuestbookAuthResponse>>(`${this.baseUrl}/auth/callback`, { code })
      .pipe(map((res) => res.data));
  }

  createEntry(message: string, accessToken: string): Observable<GuestbookEntry> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
    return this.http
      .post<ApiResponse<GuestbookEntry>>(this.baseUrl, { message }, { headers })
      .pipe(map((res) => res.data));
  }
}
