import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../../shared/components/tech-pill/tech-pill.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TiltDirective } from '../../../../shared/directives/tilt.directive';
import { MagneticDirective } from '../../../../shared/directives/magnetic.directive';
import { TranslateService } from '../../../../core/services/translate.service';
import type { Project } from '../../../../core/models';

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, SectionHeaderComponent, GlassmorphismCardComponent, TechPillComponent, ScrollAnimateDirective, TiltDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="featured-projects" class="py-24 px-6">
      <div class="mx-auto max-w-6xl">
        <app-section-header [title]="t.t('projects.title')" [label]="t.t('projects.label')" />

        <div class="bento-grid">
          @for (project of projects(); track project.id; let i = $index) {
            <a
              [routerLink]="['/projects', project.slug]"
              class="bento-cell group"
              [class.bento-featured]="i === 0"
              [class.bento-tall]="i === 1"
              appScrollAnimate
              [delay]="i * 100"
              appTilt
            >
              <app-glass-card>
                @if (project.image_url) {
                  <div class="mb-4 overflow-hidden rounded-lg">
                    <img
                      [ngSrc]="project.image_url"
                      [alt]="project.title"
                      width="800"
                      height="450"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      class="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                }
                <h3 class="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text"
                    style="background-image: linear-gradient(90deg, var(--color-primary), var(--color-secondary));">
                  {{ project.title }}
                </h3>
                @if (project.short_description) {
                  <p class="mt-2 text-sm text-white/50">{{ project.short_description }}</p>
                }
                @if (project.technologies.length) {
                  <div class="mt-4 flex flex-wrap gap-1.5">
                    @for (tech of project.technologies; track tech.id) {
                      <app-tech-pill [name]="tech.name" [iconSlug]="tech.icon_slug" />
                    }
                  </div>
                }
              </app-glass-card>
            </a>
          }
        </div>

        <div class="mt-8 text-center" appScrollAnimate>
          <a routerLink="/projects"
             appMagnetic
             [strength]="0.2"
             class="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
            {{ t.t('projects.view_all') }}
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .bento-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
    }

    @media (min-width: 768px) {
      .bento-grid {
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: minmax(280px, auto);
      }
      .bento-featured {
        grid-column: span 2;
        grid-row: span 2;
      }
      .bento-tall {
        grid-row: span 2;
      }
    }

    .bento-cell {
      display: block;
      min-width: 0;
    }

    .bento-cell :host ::ng-deep app-glass-card,
    .bento-cell app-glass-card {
      height: 100%;
    }
  `],
})
export class FeaturedProjectsComponent {
  readonly t = inject(TranslateService);
  projects = input<Project[]>([]);
}
