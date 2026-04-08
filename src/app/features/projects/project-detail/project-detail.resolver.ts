import { inject, makeStateKey, TransferState } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { Observable } from 'rxjs';
import { of, tap } from 'rxjs';
import { PortfolioService } from '../../../core/services/portfolio.service';
import type { Project } from '../../../core/models';

/**
 * Resolves the project for `/projects/:slug` before the component renders.
 * Uses TransferState so the SSR fetch is reused by the client (no double HTTP).
 * Running inside a resolver is what allows `SeoService.updateMeta` to fire
 * before the server flushes the HTML — fixing the CRIT-1 SEO gap.
 */
export const projectDetailResolver: ResolveFn<Project | null> = (route): Observable<Project | null> => {
  const portfolio = inject(PortfolioService);
  const transfer = inject(TransferState);
  const slug = route.paramMap.get('slug') ?? '';
  const KEY = makeStateKey<Project | null>(`project-${slug}`);

  if (transfer.hasKey(KEY)) {
    const cached = transfer.get(KEY, null);
    transfer.remove(KEY);
    return of(cached);
  }

  return portfolio.getProjectBySlug(slug).pipe(
    tap((data) => transfer.set(KEY, data)),
  );
};
