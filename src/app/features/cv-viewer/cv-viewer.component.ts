import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { PortfolioService } from '../../core/services/portfolio.service';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import type { SafeResourceUrl } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cv-viewer',
  standalone: true,
  imports: [SectionHeaderComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-4xl">
        <app-section-header title="Curriculum Vitae" label="Resume" />

        <div class="text-center mb-8" appScrollAnimate>
          @if (cvUrl()) {
            <a [href]="rawUrl()" download
               class="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:scale-105"
               style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
              Download PDF
            </a>
          }
        </div>

        @if (cvUrl()) {
          <div class="overflow-hidden rounded-2xl border border-white/[0.06]" appScrollAnimate [delay]="100">
            <iframe [src]="cvUrl()" class="h-[80vh] w-full" title="CV Preview"></iframe>
          </div>
        }
      </div>
    </div>
  `,
})
export class CvViewerComponent implements OnInit {
  private readonly portfolio = inject(PortfolioService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);
  readonly cvUrl = signal<SafeResourceUrl | null>(null);
  readonly rawUrl = signal<string>('');

  ngOnInit() {
    this.seo.updateMeta({ title: 'CV — Adrián Jiménez Cabello' });

    this.portfolio.getCvUrl().subscribe((res) => {
      this.rawUrl.set(res.url);
      this.cvUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.url));
    });
  }
}
