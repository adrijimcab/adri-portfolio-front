import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuroraBackgroundComponent } from './shared/components/aurora-background/aurora-background.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuroraBackgroundComponent],
  template: `
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
