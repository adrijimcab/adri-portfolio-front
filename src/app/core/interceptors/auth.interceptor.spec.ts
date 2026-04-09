import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { type HttpHandlerFn, HttpRequest, HttpResponse, type HttpEvent } from '@angular/common/http';
import { describe, it, expect, beforeEach } from 'vitest';
import { of, firstValueFrom, type Observable } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

// Collect each request that reaches the terminal handler so we can assert on it.
interface InterceptorHarness {
  capturedRequests: HttpRequest<unknown>[];
  next: HttpHandlerFn;
}

function createHarness(): InterceptorHarness {
  const capturedRequests: HttpRequest<unknown>[] = [];
  const next: HttpHandlerFn = (req): Observable<HttpEvent<unknown>> => {
    capturedRequests.push(req);
    return of(new HttpResponse({ status: 200 }));
  };
  return { capturedRequests, next };
}

class AuthServiceStub {
  readonly accessToken = signal<string | null>(null);
}

describe('authInterceptor', () => {
  let authStub: AuthServiceStub;

  beforeEach(() => {
    authStub = new AuthServiceStub();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authStub }],
    });
  });

  it('adds a Bearer Authorization header when a token is present', async () => {
    authStub.accessToken.set('TOKEN-123');
    const { capturedRequests, next } = createHarness();
    const req = new HttpRequest('GET', '/api/test');

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(authInterceptor(req, next));
    });

    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0].headers.get('Authorization')).toBe('Bearer TOKEN-123');
  });

  it('does not add a header when there is no token', async () => {
    const { capturedRequests, next } = createHarness();
    const req = new HttpRequest('GET', '/api/test');

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(authInterceptor(req, next));
    });

    expect(capturedRequests[0].headers.has('Authorization')).toBe(false);
  });

  it('does not overwrite an existing Authorization header', async () => {
    authStub.accessToken.set('TOKEN-123');
    const { capturedRequests, next } = createHarness();
    const req = new HttpRequest('GET', '/api/test', null, {
      headers: new HttpRequest('GET', '/').headers.set('Authorization', 'Bearer PRE-EXISTING'),
    });

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(authInterceptor(req, next));
    });

    expect(capturedRequests[0].headers.get('Authorization')).toBe('Bearer PRE-EXISTING');
  });
});
