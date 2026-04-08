import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { TranslateService } from './translate.service';

describe('TranslateService', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem('portfolio_lang');
    } catch {
      /* ignore */
    }
    TestBed.configureTestingModule({});
  });

  it('exposes a currentLang signal with a valid default', () => {
    const service = TestBed.inject(TranslateService);
    const lang = service.currentLang();
    expect(lang === 'es' || lang === 'en').toBe(true);
  });

  it('setLang updates the signal and persists the choice', () => {
    const service = TestBed.inject(TranslateService);
    service.setLang('en');
    expect(service.currentLang()).toBe('en');
    expect(localStorage.getItem('portfolio_lang')).toBe('en');
  });

  it('t() returns the key when no translation is found', () => {
    const service = TestBed.inject(TranslateService);
    const key = 'nonexistent.key.path.that.should.fall.through';
    expect(service.t(key)).toBe(key);
  });

  it('t() returns a string (never undefined) for a valid path', () => {
    const service = TestBed.inject(TranslateService);
    // The JSON dictionaries are nested objects; any top-level miss still returns the key.
    const result = service.t('nav.about');
    expect(typeof result).toBe('string');
  });
});
