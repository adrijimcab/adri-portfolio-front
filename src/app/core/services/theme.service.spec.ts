import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

import { ThemeService } from './theme.service';
import { PortfolioService } from './portfolio.service';

// Minimal PortfolioService stub — the real one eagerly fires 10 HTTP requests
// from its constructor, so we never want to instantiate it in tests.
class PortfolioServiceStub {
  readonly siteConfig = signal<Record<string, unknown> | null>(null);
}

describe('ThemeService', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem('theme');
    } catch {
      /* ignore */
    }
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark', 'light');

    TestBed.configureTestingModule({
      providers: [{ provide: PortfolioService, useClass: PortfolioServiceStub }],
    });
  });

  it('defaults to dark mode', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });

  it('toggles between dark and light', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
  });

  it('persists the chosen theme in localStorage on toggle', () => {
    const service = TestBed.inject(ThemeService);
    service.toggle();
    expect(localStorage.getItem('theme')).toBe('light');
    service.toggle();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
