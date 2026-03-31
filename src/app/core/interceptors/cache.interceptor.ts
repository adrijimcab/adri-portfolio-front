import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || req.url.includes('/admin/') || req.url.includes('/auth/')) {
    return next(req);
  }

  const key = req.urlWithParams;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(key, { response: event.clone(), timestamp: Date.now() });
      }
    }),
  );
};
