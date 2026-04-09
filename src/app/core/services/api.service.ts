import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { map, retry, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models';
import { TranslateService } from './translate.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly baseUrl = environment.apiUrl;
  private static readonly TIMEOUT_MS = 10_000;
  private static readonly RETRY_CONFIG = { count: 1, delay: 1_000 } as const;

  private buildUrl(endpoint: string): string {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${this.baseUrl}/${endpoint}${separator}lang=${this.translate.currentLang()}`;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(endpoint)).pipe(
      timeout(ApiService.TIMEOUT_MS),
      retry(ApiService.RETRY_CONFIG),
      map((res) => res.data),
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      timeout(ApiService.TIMEOUT_MS),
      retry(ApiService.RETRY_CONFIG),
      map((res) => res.data),
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      timeout(ApiService.TIMEOUT_MS),
      retry(ApiService.RETRY_CONFIG),
      map((res) => res.data),
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`).pipe(
      timeout(ApiService.TIMEOUT_MS),
      retry(ApiService.RETRY_CONFIG),
      map((res) => res.data),
    );
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData).pipe(
      timeout(ApiService.TIMEOUT_MS),
      retry(ApiService.RETRY_CONFIG),
      map((res) => res.data),
    );
  }
}
