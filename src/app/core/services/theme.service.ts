import { Injectable, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PortfolioService } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly portfolio = inject(PortfolioService);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const config = this.portfolio.siteConfig();
      if (!config || !isPlatformBrowser(this.platformId)) return;

      const root = document.documentElement;
      if (config['primary_color']) root.style.setProperty('--color-primary', config['primary_color']);
      if (config['secondary_color']) root.style.setProperty('--color-secondary', config['secondary_color']);
      if (config['accent_color']) root.style.setProperty('--color-accent', config['accent_color']);
      if (config['background_color']) root.style.setProperty('--color-bg', config['background_color']);
      if (config['font_family']) root.style.setProperty('--font-family', config['font_family']);
    });
  }

  init() {
    // Called from app initializer to trigger constructor effect
  }
}
