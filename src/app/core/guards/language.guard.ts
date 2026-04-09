import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateService } from '../services/translate.service';

type SupportedLang = 'es' | 'en';

const SUPPORTED_LANGS: ReadonlySet<string> = new Set<SupportedLang>(['es', 'en']);

/**
 * Reads the `:lang` route parameter and syncs it with `TranslateService`.
 * If the segment is not a supported language code, redirects to `/es/...`
 * preserving the rest of the URL.
 */
export const languageGuard: CanActivateFn = (route, state) => {
  const lang = route.paramMap.get('lang') ?? '';

  if (SUPPORTED_LANGS.has(lang)) {
    inject(TranslateService).setLang(lang as SupportedLang);
    return true;
  }

  // Strip the invalid first segment and prepend /es
  const rest = state.url.replace(/^\/[^/]*/, '');
  return inject(Router).parseUrl(`/es${rest}`);
};
