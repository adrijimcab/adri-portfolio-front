import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { GlassmorphismCardComponent } from '../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { TechPillComponent } from '../../../shared/components/tech-pill/tech-pill.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { ScrollAnimateDirective } from '../../../shared/directives/scroll-animate.directive';
import { Project } from '../../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, GlassmorphismCardComponent, TechPillComponent, SectionHeaderComponent, ScrollAnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen pt-24 px-6">
      <div class="mx-auto max-w-6xl">
        <app-section-header title="All Projects" label="Portfolio" />

        <div class="mb-8" appScrollAnimate>
          <input
            type="text"
            placeholder="Search projects..."
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-white/20 focus:bg-white/[0.08]" />
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (project of filteredProjects(); track project.id; let i = $index) {
            <a [routerLink]="['/projects', project.slug]" class="group" appScrollAnimate [delay]="i * 80">
              <app-glass-card>
                @if (project.image_url) {
                  <div class="mb-4 overflow-hidden rounded-lg">
                    <img [src]="project.image_url" [alt]="project.title"
                         class="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
export class ProjectListComponent implements OnInit {
  private readonly portfolio = inject(PortfolioService);
  readonly projects = signal<Project[]>([]);
  readonly searchQuery = signal('');

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.projects();
    if (!query) return all;
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.short_description?.toLowerCase().includes(query) ||
        p.technologies.some((t) => t.name.toLowerCase().includes(query)),
    );
  });

  ngOnInit() {
    this.portfolio.getAllProjects().subscribe((data) => this.projects.set(data));
  }
}
