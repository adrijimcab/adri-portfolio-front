import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SeoService } from '../../../core/services/seo.service';
import { TranslateService } from '../../../core/services/translate.service';
import { GlassmorphismCardComponent } from '../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../shared/components/tech-pill/tech-pill.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import type { Project } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, GlassmorphismCardComponent, TechPillComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-4xl">
        <a routerLink="/projects" class="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          {{ t.t('projects.back') }}
        </a>

        @if (project(); as p) {
          <div appScrollAnimate>
            @if (p.image_url) {
              <div class="mb-8 overflow-hidden rounded-2xl">
                <img
                  [ngSrc]="p.image_url"
                  [alt]="p.title"
                  width="1280"
                  height="720"
                  priority
                  sizes="(max-width: 768px) 100vw, 896px"
                  class="h-auto w-full object-cover"
                />
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
                  {{ t.t('projects.demo') }}
                </a>
              }
              @if (p.repo_url) {
                <a [href]="p.repo_url" target="_blank" rel="noopener"
                   class="rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
                  {{ t.t('projects.code') }}
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
  readonly t = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly portfolio = inject(PortfolioService);
  private readonly seo = inject(SeoService);
  readonly project = signal<Project | null>(null);

  ngOnInit() {
    const resolved = this.route.snapshot.data['project'] as Project | null | undefined;
    if (!resolved) {
      return;
    }
    this.project.set(resolved);
    const projectUrl = `https://adrianjimenezcabello.dev/projects/${resolved.slug}`;
    const description = resolved.description ?? resolved.short_description ?? '';
    this.seo.updateMeta({
      title: `${resolved.title} — Adrián Jiménez Cabello`,
      description,
      image: resolved.image_url ?? undefined,
      url: projectUrl,
      type: 'article',
    });
    this.seo.setProjectSchema({
      title: resolved.title,
      description,
      slug: resolved.slug,
      image: resolved.image_url ?? undefined,
      technologies: resolved.technologies.map((tech) => tech.name),
      sourceUrl: resolved.repo_url ?? undefined,
      demoUrl: resolved.demo_url ?? undefined,
    });
    this.seo.setBreadcrumbList([
      { name: 'Home', url: 'https://adrianjimenezcabello.dev/' },
      { name: 'Projects', url: 'https://adrianjimenezcabello.dev/projects' },
      { name: resolved.title, url: projectUrl },
    ]);
  }
}
