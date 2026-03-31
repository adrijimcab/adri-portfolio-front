import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import esTranslations from '../../shared/i18n/es.json';
import enTranslations from '../../shared/i18n/en.json';

type Lang = 'es' | 'en';

const TRANSLATIONS: Record<Lang, Record<string, unknown>> = {
  es: esTranslations,
  en: enTranslations,
};

const STORAGE_KEY = 'portfolio_lang';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentLang = signal<Lang>(this.detectInitialLang());

  t(key: string): string {
    const lang = this.currentLang();
    const translations = TRANSLATIONS[lang];
    const value = this.resolve(translations, key);
    return typeof value === 'string' ? value : key;
  }

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  private detectInitialLang(): Lang {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return 'es';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') {
      return stored;
    }

    const browserLang = navigator.language?.substring(0, 2);
    return browserLang === 'en' ? 'en' : 'es';
  }

  private resolve(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }
}
