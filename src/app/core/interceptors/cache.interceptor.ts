import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 50;
const ALLOWED_CONTENT_TYPES = ['application/json', 'application/ld+json'];

// LRU cache: Map preserves insertion order, re-insert on hit to mark as recent.
const cache = new Map<string, CacheEntry>();

function isCacheableContentType(response: HttpResponse<unknown>): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  return ALLOWED_CONTENT_TYPES.some((allowed) => contentType.includes(allowed));
}

function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp >= TTL_MS) {
      cache.delete(key);
    }
  }
}

function evictOldest(): void {
  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || req.url.includes('/admin/') || req.url.includes('/auth/')) {
    return next(req);
  }

  const key = req.urlWithParams;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    // LRU touch: re-insert to mark as recently used.
    cache.delete(key);
    cache.set(key, cached);
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && isCacheableContentType(event)) {
        evictExpired();
        if (cache.size >= MAX_ENTRIES) {
          evictOldest();
        }
        cache.set(key, { response: event.clone(), timestamp: Date.now() });
      }
    }),
  );
};
