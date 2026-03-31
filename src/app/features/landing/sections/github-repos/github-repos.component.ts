import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import { GlassmorphismCardComponent } from '../../../../shared/components/glassmorphism-card/glassmorphism-card.component';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate.directive';
import { TiltDirective } from '../../../../shared/directives/tilt.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { GithubCalendarComponent } from '../../../../shared/components/github-calendar/github-calendar.component';
import { TranslateService } from '../../../../core/services/translate.service';
import { GitHubRepo } from '../../../../core/models';
import { getLanguageColor } from '../../../../shared/helpers/language-colors';

@Component({
  selector: 'app-github-repos-section',
  standalone: true,
  imports: [SectionHeaderComponent, GlassmorphismCardComponent, ScrollAnimateDirective, TiltDirective, SkeletonLoaderComponent, GithubCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="github-repos" class="py-24 px-6">
      <div class="mx-auto max-w-6xl">
        <app-section-header [title]="t.t('github.title')" [label]="t.t('github.label')" />

        <app-github-calendar />

        @if (!repos()) {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <app-skeleton-loader height="160px" />
            }
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (repo of sortedRepos(); track repo.id; let i = $index) {
              <div appScrollAnimate [delay]="i * 60" appTilt>
                <a [href]="repo.html_url" target="_blank" rel="noopener noreferrer" class="block group">
                  <app-glass-card>
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="font-bold text-white text-sm group-hover:text-transparent group-hover:bg-clip-text"
                          style="background-image: linear-gradient(90deg, var(--color-primary), var(--color-secondary));">
                        {{ repo.name }}
                      </h3>
                      @if (repo.is_pinned) {
                        <svg class="h-4 w-4 shrink-0 text-white/30" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4.456.734a1.75 1.75 0 012.826.504l.613 1.327a3.08 3.08 0 002.084 1.707l2.454.584c1.332.317 1.8 1.972.832 2.94L11.06 10l3.72 3.72a.749.749 0 01-1.06 1.06L10 11.06l-2.204 2.205c-.968.968-2.623.5-2.94-.832l-.584-2.454a3.08 3.08 0 00-1.707-2.084l-1.327-.613a1.75 1.75 0 01-.504-2.826L4.456.734z"/>
                        </svg>
                      }
                    </div>

                    @if (repo.description) {
                      <p class="mt-2 text-xs text-white/50 line-clamp-2">{{ repo.description }}</p>
                    }

                    <div class="mt-3 flex items-center gap-3 text-xs text-white/40">
                      @if (repo.language) {
                        <span class="flex items-center gap-1">
                          <span class="inline-block h-2.5 w-2.5 rounded-full" [style.background-color]="getLangColor(repo.language)"></span>
                          {{ repo.language }}
                        </span>
                      }
                      @if (repo.stargazers_count > 0) {
                        <span class="flex items-center gap-1">
                          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                          </svg>
                          {{ repo.stargazers_count }}
                        </span>
                      }
                      @if (repo.forks_count > 0) {
                        <span class="flex items-center gap-1">
                          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 10 0-1.5.75.75 0 000 1.5zM8 12.75a.75.75 0 10 0-1.5.75.75 0 000 1.5z"/>
                          </svg>
                          {{ repo.forks_count }}
                        </span>
                      }
                    </div>

                    @if (repo.topics.length) {
                      <div class="mt-3 flex flex-wrap gap-1">
                        @for (topic of repo.topics.slice(0, 5); track topic) {
                          <span class="rounded-full px-2 py-0.5 text-[10px] font-medium border border-white/10 text-white/40 bg-white/[0.03]">
                            {{ topic }}
                          </span>
                        }
                      </div>
                    }
                  </app-glass-card>
                </a>
              </div>
            }
          </div>

          <div class="mt-8 text-center" appScrollAnimate>
            <a href="https://github.com/adrijimcab"
               target="_blank"
               rel="noopener noreferrer"
               class="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
              {{ t.t('github.view_all') }}
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class GitHubReposSectionComponent {
  readonly t = inject(TranslateService);
  repos = input<GitHubRepo[] | undefined>();

  sortedRepos = computed(() => {
    const list = this.repos();
    if (!list) return [];
    return [...list].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return b.stargazers_count - a.stargazers_count;
    });
  });

  getLangColor = getLanguageColor;
}
