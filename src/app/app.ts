import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuroraBackgroundComponent } from './shared/components/aurora-background/aurora-background.component';
import { ScrollProgressComponent } from './shared/components/scroll-progress/scroll-progress.component';
import { CommandPaletteComponent } from './shared/components/command-palette/command-palette.component';
import { KonamiDirective } from './shared/directives/konami.directive';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AuroraBackgroundComponent,
    ScrollProgressComponent,
    CommandPaletteComponent,
    KonamiDirective,
  ],
  template: `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div appKonami (konami)="onKonami()"></div>
    <app-scroll-progress />
    <app-aurora-background />
    <app-navbar />
    <main id="main-content" class="relative z-10">
      <router-outlet />
    </main>
    <app-footer />
    <app-command-palette />
    @if (konamiActive()) {
      <div class="konami-toast" role="status" aria-live="polite">
        🎮 Konami unlocked
      </div>
    }
  `,
  styles: [`
    .skip-link {
      position: absolute;
      top: -100px;
      left: 1rem;
      z-index: 100;
      padding: 0.75rem 1.25rem;
      background: var(--color-primary, #0a0a0a);
      color: var(--color-bg, #ffffff);
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      transition: top 0.2s ease;
    }
    .skip-link:focus {
      top: 1rem;
      outline: 2px solid var(--color-accent, #fff);
      outline-offset: 2px;
    }
    .konami-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 0.85rem 1.25rem;
      background: rgba(20, 20, 26, 0.95);
      border: 1px solid rgba(180, 140, 240, 0.4);
      color: #fff;
      border-radius: 0.5rem;
      font-weight: 600;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      z-index: 1100;
      animation: konami-in 0.3s ease-out;
    }
    @keyframes konami-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);
  readonly konamiActive = signal(false);

  ngOnInit() {
    this.theme.init();
  }

  onKonami(): void {
    this.konamiActive.set(true);
    setTimeout(() => this.konamiActive.set(false), 4000);
  }
}
