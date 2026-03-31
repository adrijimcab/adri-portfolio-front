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
    <app-scroll-progress />
    <app-aurora-background />
    <app-navbar />
    <main class="relative z-10">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);

  ngOnInit() {
    this.theme.init();
  }
}
