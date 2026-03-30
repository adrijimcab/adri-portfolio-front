import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SeoService } from '../../../core/services/seo.service';
import { GlassmorphismCardComponent } from '../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../shared/components/tech-pill/tech-pill.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { Project } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, GlassmorphismCardComponent, TechPillComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-4xl">
        <a routerLink="/projects" class="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          Back to Projects
        </a>

        @if (project(); as p) {
          <div appScrollAnimate>
            @if (p.image_url) {
              <div class="mb-8 overflow-hidden rounded-2xl">
                <img [src]="p.image_url" [alt]="p.title" class="w-full object-cover" />
              </div>
            }

            <h1 class="text-4xl font-bold text-white md:text-5xl">{{ p.title }}</h1>

            @if (p.technologies.length) {
              <div class="mt-4 flex flex-wrap gap-2">
                @for (tech of p.technologies; track tech.id) {
                  <app-tech-pill [name]="tech.name" [iconSlug]="tech.icon_slug" />
                }
              </div>
            }

            @if (p.description) {
              <div class="mt-8">
                <app-glass-card>
                  <p class="text-white/70 leading-relaxed whitespace-pre-line">{{ p.description }}</p>
                </app-glass-card>
              </div>
            }

            <div class="mt-6 flex gap-4">
              @if (p.demo_url) {
                <a [href]="p.demo_url" target="_blank" rel="noopener"
                   class="rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:scale-105"
                   style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
                  Live Demo
                </a>
              }
              @if (p.repo_url) {
                <a [href]="p.repo_url" target="_blank" rel="noopener"
                   class="rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
                  Source Code
                </a>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolio = inject(PortfolioService);
  private readonly seo = inject(SeoService);
  readonly project = signal<Project | null>(null);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.portfolio.getProjectBySlug(slug).subscribe((data) => {
      this.project.set(data);
      this.seo.updateMeta({
        title: `${data.title} — Adrián Jiménez Cabello`,
        description: data.description ?? data.short_description ?? undefined,
        image: data.image_url ?? undefined,
      });
    });
  }
}
