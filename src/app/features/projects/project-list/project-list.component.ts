import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { GlassmorphismCardComponent } from '../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../shared/components/tech-pill/tech-pill.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';
import { TranslateService } from '../../../core/services/translate.service';
import type { Project } from '../../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    GlassmorphismCardComponent,
    TechPillComponent,
    SectionHeaderComponent,
    ScrollAnimateDirective,
    TiltDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-6xl">
        <app-section-header
          [title]="t.t('projects.all_title')"
          [label]="t.t('projects.all_label')"
        />

        <div class="mb-8" appScrollAnimate>
          <input
            type="text"
            placeholder="Search projects..."
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-white/20 focus:bg-white/[0.08]"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (project of filteredProjects(); track project.id; let i = $index) {
            <a
              [routerLink]="['/', t.currentLang(), 'projects', project.slug]"
              class="group"
              appScrollAnimate
              [delay]="i * 80"
              appTilt
            >
              <app-glass-card>
                @if (project.image_url) {
                  <div class="mb-4 overflow-hidden rounded-lg">
                    <img
                      [ngSrc]="project.image_url"
                      [alt]="project.title"
                      width="640"
                      height="360"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      class="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                }
                <h3 class="font-bold text-white">{{ project.title }}</h3>
                @if (project.short_description) {
                  <p class="mt-1 text-sm text-white/50">{{ project.short_description }}</p>
                }
                @if (project.technologies.length) {
                  <div class="mt-3 flex flex-wrap gap-1">
                    @for (tech of project.technologies.slice(0, 4); track tech.id) {
                      <app-tech-pill [name]="tech.name" [iconSlug]="tech.icon_slug" />
                    }
                  </div>
                }
              </app-glass-card>
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProjectListComponent {
  readonly t = inject(TranslateService);
  private readonly portfolio = inject(PortfolioService);
  // Pull-based: toSignal cleans up automatically on component destroy.
  readonly projects = toSignal<Project[], Project[]>(this.portfolio.getAllProjects(), {
    initialValue: [],
  });
  readonly searchQuery = signal('');

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.projects();
    if (!query) return all;
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- LHS is boolean|undefined in a logical OR chain; ?? would stop on false
        p.short_description?.toLowerCase().includes(query) ||
        p.technologies.some((t) => t.name.toLowerCase().includes(query)),
    );
  });

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }
}
