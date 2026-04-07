import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuroraBackgroundComponent } from './shared/components/aurora-background/aurora-background.component';
import { ScrollProgressComponent } from './shared/components/scroll-progress/scroll-progress.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuroraBackgroundComponent, ScrollProgressComponent],
  template: `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <app-scroll-progress />
    <app-aurora-background />
    <app-navbar />
    <main id="main-content" class="relative z-10">
      <router-outlet />
    </main>
    <app-footer />
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
  `],
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);

  ngOnInit() {
    this.theme.init();
  }
}
