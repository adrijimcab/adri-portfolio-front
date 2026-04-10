import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { ContactComponent } from '../landing/sections/contact/contact.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ContactComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24">
      <app-contact [profile]="portfolio.profile()" [socialLinks]="portfolio.socialLinks() ?? []" />
    </div>
  `,
})
export class ContactPageComponent implements OnInit {
  readonly portfolio = inject(PortfolioService);
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Contacto — Adrián Jiménez Cabello',
      description:
        'Contacta con Adrián Jiménez Cabello para proyectos web, colaboraciones o consultas técnicas.',
      url: 'https://adrianjimenezcabello.dev/contact',
      type: 'website',
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Contacto', url: 'https://adrianjimenezcabello.dev/contact' },
    ]);
  }
}
