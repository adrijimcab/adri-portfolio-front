import { Injectable, inject, effect, signal, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PortfolioService } from './portfolio.service';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly portfolio = inject(PortfolioService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<ThemeMode>('dark');

  constructor() {
    // Sync remote palette tokens (primary/secondary/accent/bg/font) into CSS vars
    effect(() => {
      const config = this.portfolio.siteConfig();
      if (!config || !isPlatformBrowser(this.platformId)) return;

      const root = document.documentElement;
      if (config['primary_color'])
        root.style.setProperty('--color-primary', config['primary_color']);
      if (config['secondary_color'])
        root.style.setProperty('--color-secondary', config['secondary_color']);
      if (config['accent_color']) root.style.setProperty('--color-accent', config['accent_color']);
      if (config['background_color'])
        root.style.setProperty('--color-bg', config['background_color']);
      if (config['font_family']) root.style.setProperty('--font-family', config['font_family']);
    });

    // Hydrate the signal from localStorage on the client (post-SSR)
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          this.theme.set(stored);
        } else {
          const attr = document.documentElement.getAttribute('data-theme');
          if (attr === 'dark' || attr === 'light') this.theme.set(attr);
        }
      } catch {
        /* localStorage unavailable — keep default */
      }
    });

    // Apply theme to <html> whenever the signal changes (browser only)
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const next = this.theme();
      const root = document.documentElement;
      root.setAttribute('data-theme', next);
      root.classList.remove('dark', 'light');
      root.classList.add(next);
      root.style.colorScheme = next;
    });
  }

  toggle(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage write blocked — visual state still updates */
    }
  }
}
