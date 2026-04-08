import { TestBed } from '@angular/core/testing';
import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
  HttpHeaders,
  type HttpEvent,
} from '@angular/common/http';
import { describe, it, expect, beforeEach } from 'vitest';
import { of, firstValueFrom, type Observable } from 'rxjs';

import { cacheInterceptor } from './cache.interceptor';

interface Harness {
  callCount: number;
  next: HttpHandlerFn;
}

function createJsonHarness(): Harness {
  const state = { callCount: 0 };
  const next: HttpHandlerFn = (): Observable<HttpEvent<unknown>> => {
    state.callCount += 1;
    return of(
      new HttpResponse({
        status: 200,
        body: { data: 'payload' },
        headers: new HttpHeaders({ 'content-type': 'application/json' }),
      }),
    );
  };
  return {
    get callCount() {
      return state.callCount;
    },
    next,
  };
}

describe('cacheInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('caches GET requests with application/json content-type', async () => {
    const harness = createJsonHarness();
    // Unique URL per test run to avoid collision with the module-level cache map.
    const url = `/api/cache-test-${Math.random().toString(36).slice(2)}`;
    const req = new HttpRequest('GET', url);

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(cacheInterceptor(req, harness.next));
      await firstValueFrom(cacheInterceptor(req, harness.next));
    });

    // Second call should be served from cache.
    expect(harness.callCount).toBe(1);
  });

  it('does not cache POST requests', async () => {
    const harness = createJsonHarness();
    const url = `/api/post-test-${Math.random().toString(36).slice(2)}`;
    const req = new HttpRequest('POST', url, {});

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(cacheInterceptor(req, harness.next));
      await firstValueFrom(cacheInterceptor(req, harness.next));
    });

    expect(harness.callCount).toBe(2);
  });

  it('bypasses cache for /admin/ endpoints', async () => {
    const harness = createJsonHarness();
    const url = `/api/admin/things-${Math.random().toString(36).slice(2)}`;
    const req = new HttpRequest('GET', url);

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(cacheInterceptor(req, harness.next));
      await firstValueFrom(cacheInterceptor(req, harness.next));
    });

    expect(harness.callCount).toBe(2);
  });

  it('bypasses cache for /auth/ endpoints', async () => {
    const harness = createJsonHarness();
    const url = `/api/auth/me-${Math.random().toString(36).slice(2)}`;
    const req = new HttpRequest('GET', url);

    await TestBed.runInInjectionContext(async () => {
      await firstValueFrom(cacheInterceptor(req, harness.next));
      await firstValueFrom(cacheInterceptor(req, harness.next));
    });

    expect(harness.callCount).toBe(2);
  });
});
